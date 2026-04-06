import json
import logging
import os
import subprocess
import threading
import time
import argparse
from datetime import datetime
from websocket_server import WebsocketServer          # pip install websocket-server

# ── 日志 ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("PythonServer")

# ── 全局：已注册的客户端 ───────────────────────────────────────
# key: client_id(str)
# val: {"client": <websocket_server client dict>, "info": {...}}
registered_clients: dict[str, dict] = {}
_lock = threading.Lock()

# WebsocketServer 实例（全局引用，供所有线程主动推送消息）
_server: WebsocketServer | None = None


# ══════════════════════════════════════════════════════════════
#  消息工具
# ══════════════════════════════════════════════════════════════
def make_msg(msg_type: str, **kwargs) -> str:
    payload = {
        "type": msg_type,
        "timestamp": datetime.utcnow().isoformat(timespec="seconds"),
        **kwargs,
    }
    return json.dumps(payload, ensure_ascii=False)


def send_to(client: dict, msg_type: str, **kwargs):
    """向单个已连接的客户端发送一条消息。"""
    data = make_msg(msg_type, **kwargs)
    _server.send_message(client, data)
    log.info("  → SEND [%s] to %s  %s", msg_type, client["address"], kwargs)


# ══════════════════════════════════════════════════════════════
#  websocket-server 三个回调
# ══════════════════════════════════════════════════════════════
def on_open(client, server):
    """新连接建立。"""
    log.info("新连接: %s", client["address"])


def on_close(client, server):
    """连接断开，清理注册信息。"""
    addr = client["address"]
    with _lock:
        to_remove = [
            cid for cid, v in registered_clients.items()
            if v["client"]["id"] == client["id"]
        ]
        for cid in to_remove:
            del registered_clients[cid]
            log.info("客户端已注销: %s (%s)", cid, addr)
    log.info("连接关闭: %s", addr)


def on_message(client, server, message: str):
    """收到消息，按 type 字段路由。"""
    try:
        msg = json.loads(message)
    except json.JSONDecodeError:
        log.warning("非 JSON 消息: %r", message)
        return

    msg_type = msg.get("type", "")
    log.info("  ← RECV [%s] from %s", msg_type, client["address"])

    if msg_type == "register":
        _handle_register(client, msg)

    elif msg_type == "workflow_result":
        log.info(
            "📦 工作流结果 [%s]: status=%s  output=%s",
            msg.get("workflow_id"),
            msg.get("status"),
            msg.get("output"),
        )

    elif msg_type == "ping":
        send_to(client, "pong")

    elif msg_type == "error":
        log.error("❌ 客户端错误: %s", msg.get("message"))

    else:
        log.warning("未知消息类型: %s", msg_type)


# ══════════════════════════════════════════════════════════════
#  注册处理
# ══════════════════════════════════════════════════════════════
def _handle_register(client: dict, msg: dict):
    client_id = msg.get("client_id") or f"unknown-{client['id']}"
    info = {
        "name":         msg.get("name", client_id),
        "version":      msg.get("version", "?"),
        "platform":     msg.get("platform", "?"),
        "capabilities": msg.get("capabilities", []),
    }
    with _lock:
        registered_clients[client_id] = {"client": client, "info": info}

    log.info(
        "✅ 注册成功: %s  name=%s  caps=%s",
        client_id, info["name"], info["capabilities"],
    )
    send_to(client, "register_ack",
            client_id=client_id,
            message="注册成功，等待工作流指令")


# ══════════════════════════════════════════════════════════════
#  派发工作流（线程安全，可从任意线程调用）
# ══════════════════════════════════════════════════════════════
def dispatch_workflow(
    client_id: str,
    workflow_id: str,
    component: str,
    params: dict,
) -> bool:
    """
    向指定 client_id 的 C# 进程发送工作流执行请求。
    返回 True 表示发送成功，False 表示客户端未注册。
    """
    with _lock:
        entry = registered_clients.get(client_id)

    if entry is None:
        log.error("dispatch 失败：客户端未注册 [%s]", client_id)
        return False

    send_to(
        entry["client"], "run_workflow",
        workflow_id=workflow_id,
        component=component,
        params=params,
    )
    log.info("🚀 已派发 [%s] component=%s → %s", workflow_id, component, client_id)
    return True


# ══════════════════════════════════════════════════════════════
#  启动 C# 程序
# ══════════════════════════════════════════════════════════════
def launch_dotnet(port: int, dotnet_exe: str) -> subprocess.Popen:
    """
    通过 subprocess 启动 C# 程序，将 WebSocket 端口作为命令行参数传入。

    dotnet_exe 可以是:
      - 已发布的可执行路径   e.g. "./WorkflowClient/WorkflowClient"
      - .csproj 路径        e.g. "./WorkflowClient/WorkflowClient.csproj"
      - 项目目录            e.g. "./WorkflowClient"
                             → 自动改用 dotnet run --project
    """
    if dotnet_exe.endswith(".csproj") or os.path.isdir(dotnet_exe):
        cmd = ["dotnet", "run", "--project", dotnet_exe, "--", "--port", str(port)]
    else:
        cmd = [dotnet_exe, "--port", str(port)]

    log.info("启动 C# 程序: %s", " ".join(cmd))
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    def _pipe_output():
        for line in proc.stdout:
            print(f"[C#] {line}", end="", flush=True)

    threading.Thread(target=_pipe_output, name="dotnet-stdout", daemon=True).start()
    return proc


# ══════════════════════════════════════════════════════════════
#  演示：等待注册后在后台线程派发示例工作流
# ══════════════════════════════════════════════════════════════
def _demo_dispatch_thread():
    log.info("[demo] 等待 C# 客户端注册...")
    while True:
        with _lock:
            if registered_clients:
                client_id = next(iter(registered_clients))
                break
        time.sleep(0.5)

    log.info("[demo] 开始向 %s 派发示例工作流", client_id)

    # 1. 数据转换
    time.sleep(1)
    dispatch_workflow(
        client_id=client_id,
        workflow_id="wf-001",
        component="DataTransform",
        params={"input": "hello world", "mode": "uppercase"},
    )

    # 2. HTTP 请求
    time.sleep(2)
    dispatch_workflow(
        client_id=client_id,
        workflow_id="wf-002",
        component="HttpRequest",
        params={"url": "https://httpbin.org/get", "method": "GET"},
    )

    # 3. 表达式脚本
    time.sleep(2)
    dispatch_workflow(
        client_id=client_id,
        workflow_id="wf-003",
        component="ScriptRunner",
        params={"script": "1 + 2 * 3", "lang": "expr"},
    )


# ══════════════════════════════════════════════════════════════
#  主入口
# ══════════════════════════════════════════════════════════════
def main():
    global _server

    parser = argparse.ArgumentParser(description="Python WebSocket Workflow Server")
    parser.add_argument("--port",      type=int, default=8765,
                        help="WebSocket 监听端口（默认 8765）")
    parser.add_argument("--host",      default="127.0.0.1",
                        help="绑定地址（默认 127.0.0.1）")
    parser.add_argument("--no-launch", action="store_true",
                        help="不自动启动 C# 程序")
    parser.add_argument("--exe",       default="",
                        help="C# 可执行路径（默认读 DOTNET_EXE 环境变量）")
    args = parser.parse_args()

    host      = args.host
    port      = args.port
    dotnet_exe = args.exe or os.environ.get(
        "DOTNET_EXE", "./WorkflowClient/WorkflowClient"
    )
    launch_csharp = not args.no_launch

    # ── 创建 WebSocket 服务器 ─────────────────────────────────
    _server = WebsocketServer(host=host, port=port, loglevel=logging.WARNING)
    _server.set_fn_new_client(on_open)
    _server.set_fn_client_left(on_close)
    _server.set_fn_message_received(on_message)

    log.info("WebSocket 服务器已绑定: ws://%s:%d", host, port)

    # 在后台线程运行 server.run_forever()，主线程保持控制权
    threading.Thread(
        target=_server.run_forever,
        name="ws-server",
        daemon=True,
    ).start()
    log.info("服务已就绪，等待连接...")

    # ── 启动 C# 程序 ──────────────────────────────────────────
    proc: subprocess.Popen | None = None
    if launch_csharp:
        time.sleep(0.3)   # 等服务器线程完成端口绑定
        proc = launch_dotnet(port, dotnet_exe)
    else:
        log.info("跳过启动 C#（--no-launch）")

    # ── 演示派发（后台线程） ───────────────────────────────────
    threading.Thread(
        target=_demo_dispatch_thread,
        name="demo",
        daemon=True,
    ).start()

    # ── 主线程：阻塞等待 Ctrl+C ───────────────────────────────
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        log.info("收到中断信号，正在停止...")
    finally:
        _server.shutdown_gracefully()
        if proc:
            proc.terminate()
            log.info("C# 进程已终止")
        log.info("服务器已停止")


if __name__ == "__main__":
    main()
