import threading
import pathlib
from ..biz.setting_service import SettingService
class ComponetsService:
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
    
    def get_instance(self):
        return self._instance
    


    def query_components(self, params):
        component_path = SettingService().get_instance().get_componets_path()
        files = pathlib.glob("*.whl")
        for file in files:
            print(file)
        # dict -> dataclass 对象
        # start_params = StartParameters(**data)
        # Implementation of query_components method
        pass