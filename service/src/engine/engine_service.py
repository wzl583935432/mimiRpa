import threading
from dataclasses import dataclass, asdict
from .models.start_parameters import StartParameters
import json

class EngineService:
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
    
    def _readWorkflow(self, workflow_path):
        with open(workflow_path, "r", encoding="utf-8") as f:
            content = f.read()
        data = json.loads(content)
        # Implementation of _readWorkflow method
        pass
    
    def start_run_workflow(self, params):
        data = json.loads(params)

        # dict -> dataclass 对象
        start_params = StartParameters(**data)
        # Implementation of start_run_workflow method
        pass