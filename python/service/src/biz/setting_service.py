import threading
import os

class SettingService:
    _path:str = ""
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
    
    def __init__(self):
        app_path = os.getcwd()
        self._path = os.path.join(app_path, "components")
        pass
    
    def get_instance(self):
        return self._instance
    
    def set_componets_path(self, path):
        self._path = path
        pass
    
    def get_componets_path(self):
        return self._path