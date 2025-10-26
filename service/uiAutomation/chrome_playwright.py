
from playwright.sync_api import sync_playwright

class ChromePlaywright:
    _port = -1
    _browser = None
    _playwright = None

    def __init__(self, port):
        self._port = port
        pass
    pass

    def _handle_disconnection(self):
        self._connect()
        # TODO: 在这里执行清理或重连逻辑

    def _connect(self):
        cdp_url = f"http://localhost:{self._port}"

        if not self._playwright:
            self._playwright = sync_playwright().start() # ❌ 手动启动
        try:
            self._browser = self._playwright.chromium.connect_over_cdp(cdp_url)
            # 注册监听器
            self._browser.on("disconnected", self._handle_disconnection)
        except Exception:
            pass

    def get_viewport(self):
        if not self._browser:
            self._connect()
        if not self._browser:
            return None
        
        if (not self._browser.contexts) or len(self._browser.contexts) <=0:
            return None
         
        default_context = self._browser.contexts[0]
        pages = default_context.pages
        if (not pages) or len(pages) <= 0:
            return None
        active_page = default_context.pages[0]

        window_info = active_page.evaluate_handle(
                """() => ({
                    screenWidth: window.screen.availWidth,  // 屏幕可用宽度
                    screenHeight: window.screen.availHeight, // 屏幕可用高度
                    outerWidth: window.outerWidth,           // 浏览器窗口实际宽度 (包含边框)
                    outerHeight: window.outerHeight,         // 浏览器窗口实际高度 (包含边框)
                    screenX: window.screenX,                 // 窗口 X 坐标 (相对于屏幕)
                    screenY: window.screenY                  // 窗口 Y 坐标 (相对于屏幕)
                })"""
            ).json_value()
        


        # ---------------------------------------------------
        # 步骤 2: 获取视口（页面内容区域）的尺寸
        # ---------------------------------------------------
        viewport_size = active_page.viewport_size
        
        if not viewport_size:
            return None

        # ---------------------------------------------------
        # 步骤 3: 估算视口相对于屏幕的矩形 (Rect)
        # ---------------------------------------------------
        
        # Playwright 无法直接提供工具栏高度。
        # 浏览器工具栏高度 = 整个窗口高度 (outerHeight) - 视口高度 (viewport_size['height'])
        # 这是一个近似值，因为还需要考虑窗口边框和任务栏。
        toolbar_height_approx = window_info['outerHeight'] - viewport_size['height']
        
        # 视口左上角的 Y 坐标 = 窗口 Y 坐标 + 工具栏高度
        viewport_x = window_info['screenX']
        viewport_y = window_info['screenY'] + toolbar_height_approx

        # 最终的视口矩形
        viewport_rect = {
            'x': viewport_x,
            'y': viewport_y,
            'width': viewport_size['width'],
            'height': viewport_size['height']
        }
        return viewport_rect

        pass