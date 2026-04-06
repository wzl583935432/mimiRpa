// JsonHelper.cs — JsonElement 工具类  (.NET 6)
// 替代 .NET 7+ 专属的 file static class 写法
using System.Text.Json;

namespace WorkflowClient
{
    internal static class JsonHelper
    {
        /// <summary>安全读取 JsonElement 中指定属性的字符串值，不存在或非字符串时返回 null。</summary>
        public static string? GetStr(JsonElement el, string prop)
        {
            if (el.ValueKind == JsonValueKind.Object
                && el.TryGetProperty(prop, out JsonElement v)
                && v.ValueKind == JsonValueKind.String)
            {
                return v.GetString();
            }
            return null;
        }
    }
}
