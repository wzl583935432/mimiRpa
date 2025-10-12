from typing import Any, Callable, Optional, Union
import websocket
import sys
import json
import uuid
import time
import threading
from ..common.exception.sys_exception import SYSException
import uuid

class WebSocketContext:
    _ws = None
    _url = None
    _on_message = None
    _on_close = None
    _appname=""
    _callbackCache ={}

    def __init__(self, url: str, appName:str, on_message: Optional[Callable[[Any], None]] = None,
                on_close: Optional[Callable[[ Any, Any], None]] = None ):
        self._url = url
        self._appname = appName
        self._on_message = on_message
        self._on_close = on_close
        pass

    def start(self):
                # 创建 WebSocket 对象
        self. ws = websocket.WebSocketApp(
            self._url,  # 替换成你的服务器地址
            on_open=self.on_open,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close
        )
        self.ws.run_forever()
    
    async def on_message(self, ws, message):       
        msgObj = json.loads(message)        
        if msgObj.get('messageType') == 'request':
            try:
                retBody = await self._on_message(msgObj)
                responseData ={
                    'bizCode':msgObj.get('bizCod'),
                    "requestCode":msgObj.get('requestCode'),
                    "messageType":"response",
                    "messageId":msgObj.get('messageId', '') if msgObj else '',
                    "returnCode":"SUC0000",
                    "errorMessage": '',
                    'body':retBody
                }
                message_str = json.dumps(responseData)
                ws.send(message_str)
  
            except Exception as e:

                responseData ={
                    "requestCode":"",
                    "messageType":"response",
                    "messageId":msgObj.get('messageId', '') if msgObj else '',
                    "returnCode":"FAIL00",
                    "errorMessage": str(e)
                }
                message_str = json.dumps(responseData)
                ws.send(message_str)
        elif  msgObj.get('messageType') == 'response':
            handle = self._callbackCache.pop(msgObj.get('messageId', ''), None)
            if handle:
                handle['callback_success'](msgObj)

        print("收到消息:", message)

    def on_error(self, ws, error):
        print("错误:", error)

    def on_close(self, ws, close_status_code, close_msg):
        print("连接关闭")
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
        self.ws.send(message_str)
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
        ws.send(message_str)