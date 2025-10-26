
from playwright.sync_api import sync_playwright

class ChromePlaywright:
    _port = -1
    _browser = None
    _playwright = None

    def __init__(self, port):
        self._port = port
        pass
    pass

    def handle_disconnection(self):
        print("🚨🚨🚨 浏览器连接已断开！")
        print("这是由浏览器关闭、崩溃或网络中断引起的。")
        print("您需要重新连接或终止依赖该浏览器资源的流程。")
        # TODO: 在这里执行清理或重连逻辑

    def _connect(self):
        cdp_url = f"http://localhost:{self._port}"
        self._playwright = sync_playwright().start() # ❌ 手动启动
        try:
            self._browser = self._playwright.chromium.connect_over_cdp(cdp_url)
            # 注册监听器
            self._browser.on("disconnected", self.handle_disconnection)
        except Exception:
            pass

    def get_viewport(self):
        
        pass