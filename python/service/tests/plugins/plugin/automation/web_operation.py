
import json
from loguru import logger
import asyncio
from .model.request_element_data import RequestElementData
from .model.point import Point
from .model.web_target_element import WebTargetElement,WebTargetFrame,WebTargetElementInFrame
from typing import List
from decimal import Decimal
from .model.viewport_rect import ViewportRect
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

    async def _handle_disconnection(self):
        self._current_page = None
        self._playwright_browser = None
        self._page_cdp_client = None
        await self._connect()
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

    async def _query_element_on_point(self, current_frame, 
                                      parent_frames:List[WebTargetFrame], 
                                      web_point:Point, leftTopPoint:Point,  devicePixelRatio:Decimal):
        if None == parent_frames:
            parent_frames = []
        script_get_element =""" ([x, y]) => {
            console.log(x, y)
            isIframe = (element)=> {
                if (!element || !element.tagName) {
                        return false; // 不是有效的 DOM 元素
                    }
                
                // tagName 属性返回大写的标签名称
                const tagName = element.tagName.toUpperCase();
                
                // 检查是否是 IFRAME 或 FRAME 标签
                return tagName === 'IFRAME' || tagName === 'FRAME'; 
            }
            element = document.elementFromPoint(x, y)
            if(!element){
                return null
            }
            console.log(element)
            const is_iframe = isIframe(element) 
            rect = element.getBoundingClientRect()
            console.log(rect)
            let frameIndex = -1

            if (is_iframe){
                const allIframes = document.getElementsByTagName('iframe');
        
                // 3. 遍历集合，找到目标元素的位置
                for (let i = 0; i < allIframes.length; i++) {
                    // 使用严格相等 (===) 来比较 DOM 对象的引用
                    if (allIframes[i] === element) {
                        frameIndex = i; // 返回从 0 开始的索引
                        break
                    }
                }
            }
                        
            /**
            * 获取元素在其父节点下的元素兄弟索引 (1-based)。
            * @param {HTMLElement} element - 要获取索引的 DOM 元素。
            * @returns {number} 元素在兄弟元素中的位置 (从 1 开始计数)。
            */
            function getElementSiblingIndex(element) {
                if (!element.parentElement) {
                    return 1; // 顶层元素 (如 body, html) 没有兄弟元素，默认为 1
                }
                
                // 获取父元素的所有子元素节点 (只包括元素，不包括文本、注释等)
                const siblings = Array.from(element.parentElement.children);
                
                // 查找当前元素在子元素数组中的索引
                // Array.from(parentElement.children).indexOf(element)
                const index = siblings.indexOf(element);
                
                // 返回从 1 开始的索引 (因为 CSS/XPath 的 :nth-child(n) 或 [n] 是从 1 开始)
                return index + 1;
            }

            /**
            * 向上遍历 DOM 树，收集当前元素及其所有祖先元素的关键信息。
            * 增加了元素的兄弟索引。
            * * @param {HTMLElement} element - 要开始遍历的 DOM 元素。
            * @param {string[]} [attributes] - 要收集的属性列表。
            * @returns {Array<Object>} 包含从当前元素到顶层元素信息的数组。
            */
            function getElementChainInfoWithIndex(element, attributes) {
                // 默认要收集的属性
                const attrsToCollect = attributes || [
                    'id', 
                    'class', 
                    'name', 
                    'title', 
                    'aria-label', 
                    'placeholder', 
                    'data-testid'
                ];
                
                const chain = [];
                let currentElement = element;

                // 向上遍历，直到没有父元素
                while (currentElement && currentElement.nodeType === 1) {
                    const info = {};
                    
                    // 1. 收集元素类型 (标签名)
                    info.tag_name = currentElement.tagName.toLowerCase(); 
                    
                    // 2. 收集兄弟元素索引 (核心新增功能)
                    info.sibling_index = getElementSiblingIndex(currentElement);

                    // 3. 收集可见文本 (取前100个字符)
                    const textContent = currentElement.textContent || '';
                    info.text = textContent.trim().substring(0, 100);
                    if (textContent.trim().length > 100) {
                        info.text += '...';
                    }
                    
                    // 4. 收集指定属性
                    attrsToCollect.forEach(attr => {
                        if (currentElement.hasAttribute(attr)) {
                            info[attr] = currentElement.getAttribute(attr);
                        }
                    });
                    
                    // 将当前元素的信息添加到链的开头
                    chain.unshift(info); 

                    // 移动到下一个父元素
                    currentElement = currentElement.parentElement;
                }

                return chain;
            }

            paths = getElementChainInfoWithIndex(element)
            element.style.backgroundColor = '#f0f0f0'
            element.style.color = '#ff0000';
            console.log('frameIndex', frameIndex)
            return {
                is_iframe: is_iframe,
                frameIndex: frameIndex,
                rect:rect,
                paths: paths,
                elem: element.tagName
                
            }
        }
        """
        element_info_handler = await current_frame.evaluate_handle(script_get_element, [round(web_point.x), round(web_point.y)])
        if None == element_info_handler:
            return None
        element_info = await element_info_handler.json_value()
        if(None == element_info):
            return None
        if element_info['is_iframe']:
            print(f'在 frame 中')
            child_frames =  current_frame.child_frames
            index = 0
            for item in child_frames:
                if(index < element_info['frameIndex']):
                    index = index + 1
                    continue
                itemTargetFrame = WebTargetFrame(index=index, name= item.name, url=item.url)
                return await self._query_element_on_point(item, 
                                                           parent_frames+[itemTargetFrame],
                                                           Point( web_point.x - element_info['rect']['x'],
                                                           web_point.y - element_info['rect']['y']),
                                                           Point(leftTopPoint.x +element_info['rect']['x'], leftTopPoint.y +element_info['rect']['y']),
                                                           devicePixelRatio
                                                           )
                
            pass
        
        chains:List[WebTargetElementInFrame] = []
        for path_item in element_info['paths']:
            element_in_frame = WebTargetElementInFrame(path_item.get('tag_name', None), 
                                                       path_item.get('sibling_index', 0),
                                                       path_item.get('text',''),
                                                       path_item.get('attr', None))
            chains.append(element_in_frame)
            pass
        print(f"--------------{json.dumps(element_info)}------")
        rect = ViewportRect(leftTopPoint.x + element_info['rect']['x'],
                     leftTopPoint.y + element_info['rect']['y'], 
                     element_info['rect']['width'] , 
                     element_info['rect']['height'], devicePixelRatio)
        return WebTargetElement( parent_frames= parent_frames, chains = chains, rect = rect)



    async def get_element_on_point(self, request_element_data:RequestElementData):
        active_page = await self._get_activie_page()
        #request_element_data.view_port[]
        main_frame = active_page.main_frame

        web_target_x =  (request_element_data.target_point.x - request_element_data.view_port.x)/request_element_data.view_port.devicePixelRatio
        web_target_y = (request_element_data.target_point.y - request_element_data.view_port.y)/request_element_data.view_port.devicePixelRatio
        web_point = Point(web_target_x, web_target_y)
        print(f"--web-----{web_target_x}----- {web_target_y}-------------")

        webTargetElement:WebTargetElement = await self._query_element_on_point(main_frame, 
                                                  None,
                                                  web_point=web_point, 
                                                  leftTopPoint = Point(0, 0),
                                                  devicePixelRatio = request_element_data.view_port.devicePixelRatio
                                                  )
        if(None == webTargetElement):
            return None
        webTargetElement.rect.x = webTargetElement.rect.x * request_element_data.view_port.devicePixelRatio + request_element_data.view_port.x
        webTargetElement.rect.y = webTargetElement.rect.y * request_element_data.view_port.devicePixelRatio + request_element_data.view_port.y
        webTargetElement.rect.height = webTargetElement.rect.height * request_element_data.view_port.devicePixelRatio
        webTargetElement.rect.width = webTargetElement.rect.width * request_element_data.view_port.devicePixelRatio
        print(f"webTargetElement.rect.height {webTargetElement.rect.height}  webTargetElement.rect.width {webTargetElement.rect.width}")
        return webTargetElement




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
        
        toolbar_height_approx = (window_info['outerHeight'] - window_info['innerHeight']) - (window_info['outerWidth']  - window_info['innerWidth'])/2
        toolbar_width_approx = (window_info['outerWidth']  - window_info['innerWidth'])/2
        
        # 视口左上角的 Y 坐标 = 窗口 Y 坐标 + 工具栏高度
        viewport_x = (window_info['screenX'] + toolbar_width_approx)* window_info['devicePixelRatio'] 
        viewport_y = (window_info['screenY'] + toolbar_height_approx)* window_info['devicePixelRatio'] 
        viewport_width = window_info['innerWidth'] * window_info['devicePixelRatio'] 
        viewport_height = window_info['innerHeight'] * window_info['devicePixelRatio'] 
        # 最终的视口矩形
        return ViewportRect(viewport_x, viewport_y, viewport_width, viewport_height, window_info['devicePixelRatio'])
