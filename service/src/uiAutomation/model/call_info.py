from dataclasses import dataclass
import uuid
import threading

@dataclass
class CallInfo:
    def  __init__(self, messageCode, config = None, requestData= None):
        self.messgeId = uuid.uuid4()
        self.messageCode = messageCode
        self.requestData = requestData
        self.responseData = None
        self.response_event = threading.Event()
        self.config = config

    messgeId:str
    messageCode:str
    requestData:str
    responseData:str
    responseCode:str
    response_event:threading.Event
    config = {}
