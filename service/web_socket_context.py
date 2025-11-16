from typing import Any, Callable, Optional, Union
import websocket
import sys
import json
import uuid
import time
import threading
import uuid
from concurrent.futures import ThreadPoolExecutor
from loguru import logger
import asyncio  # 引入 asyncio 库

class WebSocketContext:
    _ws = None
    _url = None
    _on_message = None
    _on_close = None
    _appname=""
    _callbackCache ={}

    def __init__(self, url: str, 
                 appName:str,
                 on_message: Optional[Callable[[Any], None]] = None,
                 on_close: Optional[Callable[[ Any, Any], None]] = None ):
        self._url = url
        self._appname = appName
        self._on_message = on_message
        self._on_close = on_close
        self._send_lock = threading.Lock()
        self._executor = ThreadPoolExecutor(max_workers=3)
        pass

    def start(self):
        self._connect()
        logger.error(f'程序退出')

    def _connect(self):
        logger.info(f'开始启动连接服务{self._url}')
                # 创建 WebSocket 对象
        self. ws = websocket.WebSocketApp(
            self._url,  # 替换成你的服务器地址
            on_open=self.on_open,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close
        )
        logger.info(f'创建连接成功')
        self.ws.run_forever()
        logger.error(f'连接退出')

    def safe_send(self, message_str):
        # Acquire the lock before sending
        with self._send_lock:
            # Check if the connection is still active before sending
            if self.ws and self.ws.sock and self.ws.sock.connected:
                self.ws.send(message_str)
                # print(f"<- Sent response: {message_str[:50]}...")
            else:
                print("Warning: WebSocket not connected. Cannot send message.")

    def _handle_request_in_thread(self, msgObj):
        logger.info(msgObj)
        message_id = msgObj.get('messageId', '')
        message_str = ""

        try:
            # Call the synchronous business logic

            retBody = asyncio.run( self._on_message(msgObj) )
            
            # Construct success response
            responseData ={
                'bizCode':msgObj.get('bizCode'),
                "requestCode":msgObj.get('requestCode'),
                "messageType":"response",
                "messageId":message_id,
                "returnCode":"SUC0000",
                "errorMessage": '',
                'body':retBody
            }
            
        except Exception as e:
            # Construct error response
            print(f"Error processing request {message_id}: {e}")
            responseData ={
                "requestCode":msgObj.get('requestCode', ''),
                "messageType":"response",
                "messageId":message_id,
                "returnCode":"FAIL00",
                "errorMessage": str(e)
            }
            
        message_str = json.dumps(responseData)
        logger.info(f"返回 {message_str}")
        # Send the response back using the thread-safe method
        self.safe_send(message_str)

    def on_message(self, ws, message):       
        msgObj = json.loads(message)        
        if msgObj.get('messageType') == 'request':
            self._executor.submit(self._handle_request_in_thread, msgObj)
        elif  msgObj.get('messageType') == 'response':
            handle = self._callbackCache.pop(msgObj.get('messageId', ''), None)
            if handle:
                handle['callback_success'](msgObj)

        print("收到消息:", message)

    def on_error(self, ws, error):
        print("错误:", error)

    def on_close(self, ws, close_status_code, close_msg):
        print("连接关闭")
        logger.info('重连')
        self._connect()
        self._on_close(close_status_code, close_msg)

    def _request_timeout_action(self, messageId):
        handle = self._callbackCache.pop(messageId)
        if handle:
            handle['callback_failed']('超时请求')

        pass
    def send_request(self, bizCode:str, requestCode:str, body, callback_success, callback_failed, timeout):
        messageId = f"{requestCode}_{uuid.uuid4()}"
        t = threading.Timer(timeout, self._request_timeout_action, args=(messageId))
        handle = {
            "callback_success":callback_success,
            "callback_failed" :callback_failed
        }
        self._callbackCache[messageId] = handle
        requestData ={
            "bizCode":bizCode,
            "requestCode":requestCode,
            "messageType":"request",
            "messageId":messageId,
            "body":body
                }
        message_str = json.dumps(requestData)
        self.safe_send(message_str)
        t.start() 
        pass


    def on_open(self, ws):
        print("连接成功")
        id_obj = uuid.uuid4()

        # 转换为字符串
        id_str = str(id_obj)
        registerData ={
            "requestCode":"register",
            "messageType":"request",
            "messageId":id_str,
            "body":self._appname
        }
        message_str = json.dumps(registerData)
        print(f"注册消息:{message_str}")
        self.safe_send(message_str)