
import threading

from loguru import logger
from .model.call_info import CallInfo


class UIAutomationOperation:
    _instance = None
    _lock = threading.Lock()
    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        pass

    def click_select_element(self, call_info:CallInfo):
        logger.info("click select element")
        