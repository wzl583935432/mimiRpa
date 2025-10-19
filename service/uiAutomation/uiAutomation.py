
import threading
import psutil

class UIAutomation:
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
    

    def getMouseUIElementTarget(self):
        pass
    
    def _is_chrome_window(control):
        # 通过 class 或进程判断
        try:
            process = psutil.Process(control.ProcessId)
            process_name = process.name().lower()
            if 'chrome' in process_name:
                return True
        except Exception:
            pass

        # 或用 ClassName 判断
        if "Chrome_WidgetWin" in control.ClassName:
            return True

        return False