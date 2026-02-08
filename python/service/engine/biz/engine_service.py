import threading
from dataclasses import dataclass, asdict
from .models.start_parameters import StartParameters
import json
from loguru import logger
from pathlib import Path
from .workflow_service import WorkflowService
import asyncio
from .graph_biz import GraphBiz
from .running_pc import RunningPC

class EngineService:
    _instance = None
    _lock = threading.Lock()  
    route = {}
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
    
    def _readWorkflow(self, workflow_path):
        with open(workflow_path, "r", encoding="utf-8") as f:
            content = f.read()
        data = json.loads(content)
        # Implementation of _readWorkflow method
        pass

    def read_json_file(self, file_path: str | Path) -> dict | list:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"文件不存在: {path}")
        
        with open(path, encoding='utf-8') as f:
            data = json.load(f)          # 直接把文件内容解析成 dict/list
        return data
    
    def create_activity(self, class_name: str):
        # 从当前模块的全局命名空间中找类
        cls = globals().get(class_name)
        
        if cls is None or not isinstance(cls, type):
            raise ValueError(f"没有找到类: {class_name}")
        
        return cls
    
    async def start_run_workflow(self, msg):
        logger.info('-------------start_run_workflow-')
        logger.info(msg)
        logger.info('-------------start_run_workflow-')
        workflowPath = msg['body']['workflowPath']
        logger.info(workflowPath)
        data = self.read_json_file(workflowPath)

        for graph in data['workflowGraphs']:
            #self._graph_cache[graph['main']] = json.load(graph['content'])
            WorkflowService().get_instance().insert_graph(graph['id'], graph['name'], graph['content']) 

        for node_property in data['nodeProperties']:
            WorkflowService().get_instance().insert_property(node_property['nodeId'], node_property)

        graphbiz = WorkflowService().get_instance().get_start_graph()
        await self.run(graph=graphbiz)
        #asyncio.run()
        
        
    async def run(self, graph:GraphBiz):
        running_pc = RunningPC(None, graph_biz= graph)
        await running_pc.run()
        