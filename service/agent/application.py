
import threading
import websocket
import sys
import json
import uuid
import time
from loguru import logger

class Application:
    _instance = None
    _lock = threading.Lock()  

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    _appname=""
    
    def start(self):
        import argparse
        parser = argparse.ArgumentParser()
        parser.add_argument("--name", default="localhost")
        parser.add_argument("--port", type=int, default=8080)
        args = parser.parse_args()
        logger.info(args.port)
        logger.info(args.name)
        self._appname= args.name
        # 创建 WebSocket 对象
        ws = websocket.WebSocketApp(
            f"ws://localhost:{args.port}",  # 替换成你的服务器地址
            on_open=self.on_open,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close
        )
        ws.run_forever()
        pass

    def on_message(self, ws, message):
        print("收到消息:", message)

    def on_error(self, ws, error):
        print("错误:", error)

    def on_close(self, ws, close_status_code, close_msg):
        print("连接关闭")
        sys.exit()

    def on_open(self, ws):
        print("连接成功")
        id_obj = uuid.uuid4()

        # 转换为字符串
        id_str = str(id_obj)
        registerData ={
            "messageCode":"register",
            "messageType":"request",
            "messageId":id_str,
            "subProcessName":self._appname
        }
        message_str = json.dumps(registerData)
        print(f"注册消息:{message_str}")
        ws.send(message_str)


