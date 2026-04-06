// Program.cs — WorkflowClient 入口  (.NET 6)
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using WorkflowClient;

// ── 解析命令行 --port <n> ─────────────────────────────────────
int port = 8765;
for (int i = 0; i < args.Length - 1; i++)
{
    if ((args[i] == "--port" || args[i] == "-p")
        && int.TryParse(args[i + 1], out int p))
    {
        port = p;
        break;
    }
}

// ── 日志工厂 ──────────────────────────────────────────────────
using var logFactory = LoggerFactory.Create(builder =>
    builder
        .AddSimpleConsole(o =>
        {
            o.SingleLine      = true;
            o.TimestampFormat = "HH:mm:ss ";
        })
        .SetMinimumLevel(LogLevel.Debug));

var logger = logFactory.CreateLogger("WorkflowClient");
logger.LogInformation("WorkflowClient 启动，目标端口: {Port}", port);

// ── 取消令牌（响应 Ctrl+C） ───────────────────────────────────
var cts = new CancellationTokenSource();
Console.CancelKeyPress += (_, e) =>
{
    e.Cancel = true;
    cts.Cancel();
};

// ── 启动客户端 ────────────────────────────────────────────────
var client = new WsClient(port, logFactory, cts.Token);
await client.RunAsync();

logger.LogInformation("WorkflowClient 已退出");
