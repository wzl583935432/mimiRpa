import threading 
from .base_activity import BaseActivity
class ActivityManager:
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
    
    def get_all_activities(self):
        return self._get_all_activities(BaseActivity)
        
    def _get_all_activities(self, cla):
        final_classes = []
        
        # 遍历直接子类
        for subclass in cla.__subclasses__():
            if getattr(subclass, "_final_activity_decorate_is_final_", False):
                final_classes.append(subclass)
            # 递归寻找孙子类
            final_classes.extend(self._get_all_activities(subclass))
            
        return final_classes
        