from typing import Dict, Any
from .graph_biz import GraphBiz
import threading

class WorkflowService:
    _instance = None
    _lock = threading.Lock()  
    _graph_cache:Dict[str, GraphBiz] = {}
    _node_properties:Dict[str, Dict[str, Dict]] = {}
    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def get_instance(self):
        return self._instance
    
    def insert_graph(self, graph_id:str, graph_name:str, graph:str):
        graphbiz = GraphBiz(graph_id=graph_id, graph_name=graph_name, graph_content = graph)
        self._graph_cache[graph_id] = graphbiz

    def insert_property(self, nodeId:str, property:Dict):
        self._node_properties
        prop_name = property.get("propertyName")
        if not prop_name:
            return
        if nodeId not in self._node_properties:
            self._node_properties[nodeId] = {}
        self._node_properties[nodeId][prop_name] = property

    def get_start_graph(self) -> GraphBiz:
        return  self._graph_cache['main'] 
    
    def get_node_properties(self, node_id)->Dict[str, Dict]:
        if node_id in self._node_properties:
            return self._node_properties[node_id]
        return None
        