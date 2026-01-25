import threading
from typing import Dict, Any

class VaribleService:
    _instance = None
    _lock = threading.Lock()  
    varibles: Dict[str, Any] = {}
    ws_context = None

   # _graph_cache = {}

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def get_instance(self):
        return self._instance