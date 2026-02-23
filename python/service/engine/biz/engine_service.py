import threading
from dataclasses import dataclass, asdict
import traceback
from .models.start_parameters import StartParameters
import json
from loguru import logger
from pathlib import Path
from .workflow_service import WorkflowService
import asyncio
from .graph_biz import GraphBiz
from .running_pc import RunningPC
import types

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
        
    async def engine_run(self, script_str, graphId:str = None):
        try:
            logger.info(f"__name__ ---- {__name__}")
            current_packege = __package__
            logger.info(f"current_packege ---- {current_packege}")  
            graphId_str = graphId.replace('-', '_') if graphId else "main"
            # 创建独立模块环境
            module = types.ModuleType(f"{current_packege}.engine_service_{graphId_str}")
            module.__dict__["__name__"] = f"{current_packege}.engine_service_{graphId_str}"
            module.__dict__["__package__"] = current_packege

            # 执行脚本
            exec(script_str, module.__dict__)

            # 获取 run 函数
            main_func = module.__dict__.get("run")
            if main_func is None:
                raise ValueError("脚本中未定义 run()")
            logger.info(f"执行函数 ---- {main_func}")
            # 加超时保护（非常重要）
            result = await asyncio.wait_for(main_func(), timeout=60)

            return result

        except asyncio.TimeoutError:
            logger.error("脚本执行超时")
            raise

        except Exception as e:
            logger.error("脚本执行异常:\n" + traceback.format_exc())
            raise

    async def run(self, graph:GraphBiz):
        script_str = graph.build_code()
        logger.info(f"执行脚本 ---- {script_str}")
        #running_pc = RunningPC(None, graph_biz= graph)
        await self.engine_run(script_str, graphId=graph.get_graph_id())
        