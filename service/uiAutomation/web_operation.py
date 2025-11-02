
import json
from loguru import logger
import asyncio

class ChromeOperation:
    _port = -1
    _playwright_browser = None
    _playwright = None

    _page_cdp_client = {}
    _current_page = None

    _is_start_select_element = False
    

    def __init__(self, playwright , port):
        self._playwright = playwright
        self._port = port
        pass
    pass

    def _handle_disconnection(self):
        self._current_page = None
        self._playwright_browser = None
        self._connect()
        # TODO: 在这里执行清理或重连逻辑

    async def _connect(self):
        cdp_url = f"http://localhost:{self._port}"

        try:
            self._playwright_browser = await self._playwright.chromium.connect_over_cdp(cdp_url)
            # 注册监听器
            self._playwright_browser.on("disconnected", self._handle_disconnection)
        except Exception as e:
            print(f'创建连接失败{e}')
            pass
    async def _onepage_close(self):
        self._current_page = None
        self._current_page_cdp_client = None

    async def _get_cdp_client(self, page):
        page_cdp_client = None
        if page in self._page_cdp_client:
            page_cdp_client = self._page_cdp_client[page]
            
        if None == page_cdp_client:
            page_cdp_client = await page.context.new_cdp_session(page)
            self._page_cdp_client[page] = page_cdp_client
        return page_cdp_client

    async def _get_activie_page(self):
        if self._current_page:
            print('获取到激活的page')
            return self._current_page
        if not self._playwright_browser:
            await self._connect()
        if not self._playwright_browser:
            print('self browser None')
            return None
        print('get_viewport ')
        if (not self._playwright_browser.contexts) or len(self._playwright_browser.contexts) <=0:
            print('self contexts None')
            return None
         
        default_context = self._playwright_browser.contexts[0]
        pages = default_context.pages
        if (not pages) or len(pages) <= 0:
            print('self pages None')
            return None
        active_page = pages[-1]
        self._current_page = active_page
        if self._current_page:
            self._current_page.on("close", self._onepage_close)
        return active_page

    async def _process_selected_node(self, event):
        """处理 Overlay.inspectNodeRequested 事件并提取元素信息"""
        backend_node_id = event['backendNodeId']
        print('---****---_process_selected_node')
        current_page = await self._get_activie_page()
        cdp_client = await self._get_cdp_client(current_page)
        
        print("\n--- 元素被选中 ---")
        print(f"BackendNodeId: {backend_node_id}")

        try:
            # 1. 将 BackendNodeId 转换为远程对象 (RemoteObject)
            resolve_result = await cdp_client.send('DOM.resolveNode', {'backendNodeId': backend_node_id})
            object_id = resolve_result['object']['objectId']

            # 2. 在浏览器上下文中使用 Runtime.callFunctionOn 获取元素的简要信息
            get_info_script = """
                function() { 
                    return { 
                        tagName: this.tagName,
                        id: this.id,
                        className: this.className,
                        outerHTML: this.outerHTML.substring(0, 150) + '...'
                    } 
                }
            """
            
            info_result = await cdp_client.send('Runtime.callFunctionOn', {
                'objectId': object_id,
                'functionDeclaration': get_info_script,
                'returnByValue': True,
            })

            if info_result.get('result') and info_result['result'].get('value'):
                element_info = info_result['result']['value']
                print("🚀 提取到的元素信息:")
                for key, value in element_info.items():
                    print(f"  {key}: {value}")
                
                # 退出程序
                await cdp_client.send('Overlay.setInspectMode', {'mode': 'none'})

                # 注意: 如果需要立即停止整个程序，你可能需要更复杂的信号机制
            
        except Exception as e:
            print(f"处理元素信息时发生错误: {e}")

    def _handle_inspect_node_requested(self, event):
            print('_handle_inspect_node_requested ')
            # 使用 asyncio.create_task 在事件处理函数中运行异步代码
            asyncio.create_task(self._process_selected_node(event))

    async def begin_select_element(self):
        if(self._is_start_select_element):
            print('-------- begin_select_element----')
            return 
        self._is_start_select_element = True
        print('-------- begin_select_element')
        current_page = await self._get_activie_page()
        cdp_client = await self._get_cdp_client(current_page)

        await cdp_client.send('DOM.enable')
        await cdp_client.send('Runtime.enable')
        await cdp_client.send('Overlay.enable')
  
        print("💡 元素选取工具已激活。请在页面上点击一个元素...")

        # 5. 调用 Overlay.setInspectMode 来激活选取模式
        await cdp_client.send('Overlay.setInspectMode', {
            'mode': 'searchForNode',
            'highlightConfig': {
                'contentColor': {'r': 111, 'g': 168, 'b': 220, 'a': 0.3},
                'paddingColor': {'r': 111, 'g': 168, 'b': 220, 'a': 0.3},
                'borderColor': {'r': 111, 'g': 168, 'b': 220, 'a': 0.3},
                'marginColor': {'r': 111, 'g': 168, 'b': 220, 'a': 0.3}
            }
        })
              # 4. 注册事件监听器
        cdp_client.on('Overlay.inspectNodeRequested', self._handle_inspect_node_requested)
        
        pass
    
    async def end_select_element(self):
        self._is_start_select_element = False
        current_page = await self._get_activie_page()
        cdp_client = await self._get_cdp_client(current_page)
        await cdp_client.send('Overlay.setInspectMode', {'mode': 'none'})
        pass

    async def get_viewport(self):
        active_page = await self._get_activie_page()
        script_get_view_port =  """() => ({
                    devicePixelRatio: window.devicePixelRatio,//缩放比例
                    screenWidth: window.screen.availWidth,  // 屏幕可用宽度
                    screenHeight: window.screen.availHeight, // 屏幕可用高度
                    outerWidth: window.outerWidth,           // 浏览器窗口实际宽度 (包含边框)
                    outerHeight: window.outerHeight,         // 浏览器窗口实际高度 (包含边框)
                    innerWidth: window.innerWidth,           // 浏览器窗口实际宽度 (包含边框)
                    innerHeight: window.innerHeight,         // 浏览器窗口实际高度 (包含边框)
                    screenX: window.screenX,                 // 窗口 X 坐标 (相对于屏幕)
                    screenY: window.screenY                  // 窗口 Y 坐标 (相对于屏幕)
                })"""

        window_info_handle = await active_page.evaluate_handle(
            script_get_view_port
            )
        
        window_info = await window_info_handle.json_value()
    
        # 3. 现在 window_info_data 是一个标准的 Python 字典，可以安全地序列化了
        json_string = json.dumps(window_info, indent=4)
        
        print(f"  { json.dumps(json_string)}")
        
        toolbar_height_approx = window_info['outerHeight'] - window_info['innerHeight'] 
        toolbar_width_approx = window_info['outerWidth']  - window_info['innerWidth']
        
        # 视口左上角的 Y 坐标 = 窗口 Y 坐标 + 工具栏高度
        viewport_x = (window_info['screenX'] + toolbar_width_approx)* window_info['devicePixelRatio'] 
        viewport_y = (window_info['screenY'] + toolbar_height_approx)* window_info['devicePixelRatio'] 
        viewport_width = window_info['innerWidth'] * window_info['devicePixelRatio'] 
        viewport_height = window_info['innerHeight'] * window_info['devicePixelRatio'] 
        
        # 最终的视口矩形
        viewport_rect = {
            'x': viewport_x,
            'y': viewport_y,
            'width': viewport_width,
            'height': viewport_height
        }
        print (f"get_viewport ok  {json.dumps(viewport_rect)} ")
        return viewport_rect

        pass