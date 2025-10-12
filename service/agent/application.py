
import threading
import sys
from web_socket_context import WebSocketContext
from loguru import logger
from .controller.selector_controller import SelectController
from ..common.exception.sys_exception import SYSException
class Application:
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
            'select':SelectController()
        }
        self.ws_context = WebSocketContext(f"ws://localhost:{args.port}", args.name, )
        # 创建 WebSocket 对象

        pass

    async def on_request(self, msgObj):
        bizCode = msgObj.get('bizCode')
        handler = self.route.get(bizCode)

        if handler:
            # 调用业务代码处理消息
            return await handler(self, self.ws_context, msgObj)
        else:
            raise SYSException(f"没有该处理类型{bizCode}")
        pass


    def on_close(self, ws, close_status_code, close_msg):
        sys.exit(1)


