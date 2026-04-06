# Python WebSocket Server + C# .NET 6 工作流系统

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                     Python Server (server.py)               │
│                                                             │
│  asyncio + websockets                                       │
│  ┌──────────────┐   启动子进程   ┌─────────────────────┐   │
│  │  WebSocket   │ ────────────→  │  subprocess.Popen   │   │
│  │  Server      │   --port 8765  │  WorkflowClient.exe │   │
│  │  :8765       │                └─────────────────────┘   │
│  └──────┬───────┘                                          │
│         │ WebSocket                                         │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│               C# WorkflowClient (.NET 6)                    │
│                                                             │
│  1. 解析 --port 命令行参数                                   │
│  2. 连接 ws://127.0.0.1:{port}                              │
│  3. 发送 register 消息（client_id, name, capabilities）     │
│  4. 接收 run_workflow 命令                                   │
│  5. 根据 component 路由到对应工作流组件                       │
│  6. 返回 workflow_result 给 Python                          │
└─────────────────────────────────────────────────────────────┘
```

## 消息协议

### C# → Python: 注册
```json
{
  "type": "register",
  "client_id": "dotnet-abc12345",
  "name": "DotNet WorkflowClient",
  "version": "1.0.0",
  "platform": ".NET 6.0.0",
  "capabilities": ["DataTransform", "HttpRequest", "ScriptRunner", "FileIO"]
}
```

### Python → C#: 触发工作流
```json
{
  "type": "run_workflow",
  "workflow_id": "wf-001",
  "component": "DataTransform",
  "params": {
    "input": "hello world",
    "mode": "uppercase"
  }
}
```

### C# → Python: 返回结果
```json
{
  "type": "workflow_result",
  "workflow_id": "wf-001",
  "component": "DataTransform",
  "status": "success",
  "output": "HELLO WORLD"
}
```

## 支持的工作流组件

| 组件名         | 说明         | 参数                                          |
|--------------|------------|-----------------------------------------------|
| DataTransform | 数据转换     | `input`, `mode` (uppercase/lowercase/reverse/base64) |
| HttpRequest   | HTTP 请求   | `url`, `method` (GET/POST), `body`            |
| ScriptRunner  | 脚本执行     | `script`, `lang`                              |
| FileIO        | 文件操作     | `action` (read/write/list), `path`, `content` |

## 快速开始

### 1. 安装 Python 依赖
```bash
pip install websockets
```

### 2. 编译 C# 项目
```bash
cd WorkflowClient
dotnet build -c Release
```

### 3. 启动（自动模式：Python 自动拉起 C#）
```bash
# 设置 C# 可执行文件路径
export DOTNET_EXE=./WorkflowClient

python server.py
```

### 4. 手动模式（分别启动）
```bash
# 终端 1: 只启动 Python（不自动拉起 C#）
LAUNCH_CSHARP=0 python server.py

# 终端 2: 手动启动 C#
cd WorkflowClient
dotnet run -- --port 8765
```

## 扩展：添加新工作流组件

在 `WorkflowComponents.cs` 添加新方法：

```csharp
public static string MyComponent(JsonElement p)
{
    var param = p.GetStr("my_param") ?? "default";
    // 业务逻辑...
    return result;
}
```

在 `WsClient.cs` 的 switch 语句中注册：

```csharp
"MyComponent" => WorkflowComponents.MyComponent(paramsJson),
```

在 Python 中调用：

```python
await dispatch_workflow(
    client_id="dotnet-xxx",
    workflow_id="wf-100",
    component="MyComponent",
    params={"my_param": "value"}
)
```
