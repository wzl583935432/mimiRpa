
import threading
import traceback
import sys
from web_socket_context import WebSocketContext
from loguru import logger
from controller.selector_controller import SelectController
from controller.componets_controller import ComponentsController
from common.exception.sys_exception import SYSException
class AssistantApplication:
    _instance = None
    _lock = threading.Lock()  
    route = {}
    ws_context = None

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance
    

    def start(self):
        try:
            if self.ws_context != None:
                return
            import argparse
            parser = argparse.ArgumentParser()
            parser.add_argument("--name", default="localhost")
            parser.add_argument("--port", type=int, default=8080)
            args = parser.parse_args()
            logger.info(args.port)
            logger.info(args.name)
            self._appname= args.name
            self.route = {
                'select':SelectController(),
                'components':ComponentsController()
            }
            self.ws_context = WebSocketContext(f"ws://localhost:{args.port}", args.name, on_message=self.on_request )
            self.ws_context.start()
        except Exception as e:
            logger.error(f'创建连接失败{e}')
            sys.exit(-1)
            pass
        
        # 创建 WebSocket 对象

        pass

    async def on_request(self, msgObj):
        try:
            bizCode = msgObj.get('bizCode', None)
            handler = self.route.get(bizCode, None)
            
            if handler:
                logger.info(f'找到了选择元素的的处理handler {handler.dispatchMessage} ')
                # 调用业务代码处理消息
                return await handler.dispatchMessage(self.ws_context, msgObj)
            else:
                raise SYSException(f"没有该处理类型{bizCode}")
            pass
        except Exception as e:
            traceback.print_exc()
            logger.error('处理请求失败')
            return None
        

    def on_close(self, ws, close_status_code, close_msg):
        sys.exit(1)


