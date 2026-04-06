// WorkflowComponents.cs — 工作流组件库  (.NET 6)
using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace WorkflowClient
{
    /// <summary>
    /// 工作流组件库。每个静态方法对应一个可被 Python 调度的组件。
    /// 参数通过 JsonElement 传入，返回字符串结果。
    /// </summary>
    public static class WorkflowComponents
    {
        // ══════════════════════════════════════════════════════
        //  组件 1: 数据转换
        //  params: { "input": "...", "mode": "uppercase|lowercase|reverse|base64" }
        // ══════════════════════════════════════════════════════
        public static string DataTransform(JsonElement p)
        {
            var input = JsonHelper.GetStr(p, "input")
                        ?? throw new ArgumentException("缺少参数 'input'");
            var mode  = (JsonHelper.GetStr(p, "mode") ?? "uppercase").ToLowerInvariant();

            return mode switch
            {
                "uppercase" => input.ToUpperInvariant(),
                "lowercase" => input.ToLowerInvariant(),
                "reverse"   => new string(input.Reverse().ToArray()),
                "base64"    => Convert.ToBase64String(Encoding.UTF8.GetBytes(input)),
                _           => throw new ArgumentException($"未知 mode: {mode}")
            };
        }

        // ══════════════════════════════════════════════════════
        //  组件 2: HTTP 请求
        //  params: { "url": "...", "method": "GET|POST", "body": "..." }
        // ══════════════════════════════════════════════════════
        public static async Task<string> HttpRequest(JsonElement p)
        {
            var url    = JsonHelper.GetStr(p, "url")
                         ?? throw new ArgumentException("缺少参数 'url'");
            var method = (JsonHelper.GetStr(p, "method") ?? "GET").ToUpperInvariant();
            var body   = JsonHelper.GetStr(p, "body");

            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
            http.DefaultRequestHeaders.UserAgent.ParseAdd("WorkflowClient/1.0");

            HttpResponseMessage resp = method switch
            {
                "GET"  => await http.GetAsync(url),
                "POST" => await http.PostAsync(url,
                              new StringContent(body ?? "{}", Encoding.UTF8, "application/json")),
                _      => throw new ArgumentException($"不支持的 HTTP 方法: {method}")
            };

            var text = await resp.Content.ReadAsStringAsync();
            // 截断避免消息过大
            return text.Length > 500 ? text.Substring(0, 500) + "…(truncated)" : text;
        }

        // ══════════════════════════════════════════════════════
        //  组件 3: 脚本 / 表达式执行（沙箱）
        //  params: { "script": "...", "lang": "expr" }
        //  生产环境建议接入 Roslyn Scripting API
        // ══════════════════════════════════════════════════════
        public static string ScriptRunner(JsonElement p)
        {
            var script = JsonHelper.GetStr(p, "script")
                         ?? throw new ArgumentException("缺少参数 'script'");
            var lang   = (JsonHelper.GetStr(p, "lang") ?? "expr").ToLowerInvariant();

            if (lang == "expr" || lang == "csharp_expr")
            {
                // 白名单：只允许数字、运算符、空格、科学计数法 e/E
                bool hasInvalidChar = false;
                foreach (char c in script)
                {
                    if (char.IsLetter(c) && c != 'e' && c != 'E')
                    {
                        hasInvalidChar = true;
                        break;
                    }
                }

                if (hasInvalidChar)
                    return $"[沙箱] 已拦截非法表达式: {script}";

                try
                {
                    var result = EvalMathExpr(script);
                    return result.ToString("G");
                }
                catch
                {
                    return $"[沙箱] 表达式解析失败: {script}";
                }
            }

            return $"[{lang}] 收到脚本 ({script.Length} chars)，已记录（待接入执行引擎）";
        }

        // ══════════════════════════════════════════════════════
        //  组件 4: 文件 I/O
        //  params: { "action": "read|write|list", "path": "...", "content": "..." }
        // ══════════════════════════════════════════════════════
        public static string FileIO(JsonElement p)
        {
            var action  = (JsonHelper.GetStr(p, "action") ?? "list").ToLowerInvariant();
            var path    = JsonHelper.GetStr(p, "path") ?? ".";
            var content = JsonHelper.GetStr(p, "content") ?? string.Empty;

            // 限制只能操作应用目录子路径
            var baseDir  = AppContext.BaseDirectory;
            var fullPath = Path.GetFullPath(Path.Combine(baseDir, path));
            if (!fullPath.StartsWith(baseDir))
                throw new UnauthorizedAccessException("路径越界，禁止访问");

            return action switch
            {
                "read"  => File.Exists(fullPath)
                               ? File.ReadAllText(fullPath)
                               : $"文件不存在: {path}",
                "write" => WriteFile(fullPath, content),
                "list"  => Directory.Exists(fullPath)
                               ? string.Join("\n", Directory.GetFileSystemEntries(fullPath)
                                                            .Select(e => Path.GetFileName(e)!))
                               : $"目录不存在: {path}",
                _       => throw new ArgumentException($"未知 action: {action}")
            };
        }

        // ── 私有辅助 ──────────────────────────────────────────
        private static string WriteFile(string fullPath, string content)
        {
            var dir = Path.GetDirectoryName(fullPath);
            if (dir != null) Directory.CreateDirectory(dir);
            File.WriteAllText(fullPath, content);
            return $"已写入 {content.Length} 字节 → {Path.GetFileName(fullPath)}";
        }

        /// <summary>利用 DataTable.Compute 求值纯数学表达式，无需 Roslyn。</summary>
        private static double EvalMathExpr(string expr)
        {
            var table = new System.Data.DataTable();
            return Convert.ToDouble(table.Compute(expr, null));
        }
    }
}
