// WsClient.cs — WebSocket 连接 + 注册 + 工作流路由  (.NET 6)
using System;
using System.Net.WebSockets;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Websocket.Client;

namespace WorkflowClient
{
    public sealed class WsClient
    {
        private readonly int _port;
        private readonly ILogger _log;
        private readonly CancellationToken _ct;

        // 唯一标识：取 GUID 前 8 位
        private readonly string _clientId;
        private readonly string _clientName = "DotNet WorkflowClient";
        private readonly string _version    = "1.0.0";

        public WsClient(int port, ILoggerFactory logFactory, CancellationToken ct)
        {
            _port     = port;
            _log      = logFactory.CreateLogger<WsClient>();
            _ct       = ct;
            _clientId = "dotnet-" + Guid.NewGuid().ToString("N").Substring(0, 8);
        }

        public async Task RunAsync()
        {
            var url = new Uri($"ws://127.0.0.1:{_port}");
            _log.LogInformation("连接到 {Url}", url);

            Func<ClientWebSocket> factory = () =>
            {
                var ws = new ClientWebSocket();
                ws.Options.KeepAliveInterval = TimeSpan.FromSeconds(15);
                return ws;
            };

            using var client = new WebsocketClient(url, factory)
            {
                ReconnectTimeout      = TimeSpan.FromSeconds(10),
                ErrorReconnectTimeout = TimeSpan.FromSeconds(5),
            };

            // ── 重连事件（每次连接 / 重连后都发注册） ─────────────
            client.ReconnectionHappened.Subscribe(info =>
            {
                _log.LogInformation("已连接 (type={Type})，发送注册消息", info.Type);
                SendRegister(client);
            });

            // ── 断连事件 ──────────────────────────────────────────
            client.DisconnectionHappened.Subscribe(info =>
                _log.LogWarning("连接断开: {Type} {Status}", info.Type, info.CloseStatus));

            // ── 消息接收 ──────────────────────────────────────────
            client.MessageReceived.Subscribe(msg => HandleMessage(client, msg));

            await client.Start();
            _log.LogInformation("WebSocket 客户端已启动，clientId={Id}", _clientId);

            // 启动心跳（不阻塞）
            _ = HeartbeatLoop(client);

            // 阻塞直到取消
            try
            {
                await Task.Delay(Timeout.Infinite, _ct);
            }
            catch (OperationCanceledException) { }

            await client.Stop(WebSocketCloseStatus.NormalClosure, "Client shutdown");
        }

        // ════════════════════════════════════════════════════════
        //  注册
        // ════════════════════════════════════════════════════════
        private void SendRegister(WebsocketClient client)
        {
            var msg = new
            {
                type         = "register",
                client_id    = _clientId,
                name         = _clientName,
                version      = _version,
                platform     = ".NET " + Environment.Version.ToString(),
                capabilities = new[] { "DataTransform", "HttpRequest", "ScriptRunner", "FileIO" }
            };
            Send(client, msg);
        }

        // ════════════════════════════════════════════════════════
        //  消息路由
        // ════════════════════════════════════════════════════════
        private void HandleMessage(WebsocketClient client, ResponseMessage msg)
        {
            if (msg.Text == null) return;

            using var doc  = JsonDocument.Parse(msg.Text);
            var root       = doc.RootElement;
            var type       = JsonHelper.GetStr(root, "type") ?? string.Empty;

            _log.LogDebug("← RECV [{Type}]", type);

            switch (type)
            {
                case "register_ack":
                    _log.LogInformation("✅ 注册确认: {Msg}", JsonHelper.GetStr(root, "message"));
                    break;

                case "run_workflow":
                    HandleRunWorkflow(client, root);
                    break;

                case "pong":
                    _log.LogDebug("♥ pong");
                    break;

                default:
                    _log.LogWarning("未知消息类型: {Type}", type);
                    break;
            }
        }

        // ════════════════════════════════════════════════════════
        //  执行工作流
        // ════════════════════════════════════════════════════════
        private void HandleRunWorkflow(WebsocketClient client, JsonElement root)
        {
            var workflowId = JsonHelper.GetStr(root, "workflow_id") ?? "?";
            var component  = JsonHelper.GetStr(root, "component")   ?? "Unknown";
            var paramsEl   = root.TryGetProperty("params", out var p) ? p : default;

            _log.LogInformation("🚀 执行工作流 [{Id}] component={Comp}", workflowId, component);

            string output;
            string status;
            try
            {
                output = component switch
                {
                    "DataTransform" => WorkflowComponents.DataTransform(paramsEl),
                    "HttpRequest"   => WorkflowComponents.HttpRequest(paramsEl)
                                                         .GetAwaiter().GetResult(),
                    "ScriptRunner"  => WorkflowComponents.ScriptRunner(paramsEl),
                    "FileIO"        => WorkflowComponents.FileIO(paramsEl),
                    _               => throw new NotSupportedException($"未知组件: {component}")
                };
                status = "success";
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "工作流执行失败");
                output = ex.Message;
                status = "error";
            }

            Send(client, new
            {
                type        = "workflow_result",
                workflow_id = workflowId,
                component,
                status,
                output
            });

            _log.LogInformation("📦 结果已发送 [{Id}] status={St}", workflowId, status);
        }

        // ════════════════════════════════════════════════════════
        //  心跳（30 秒一次）
        // ════════════════════════════════════════════════════════
        private async Task HeartbeatLoop(WebsocketClient client)
        {
            using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
            try
            {
                while (await timer.WaitForNextTickAsync(_ct))
                    Send(client, new { type = "ping" });
            }
            catch (OperationCanceledException) { }
        }

        // ════════════════════════════════════════════════════════
        //  发送辅助
        // ════════════════════════════════════════════════════════
        private static void Send(WebsocketClient client, object payload)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(payload);
            client.Send(json);
        }
    }
}
