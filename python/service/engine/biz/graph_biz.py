import json
from typing import Dict, Any
from dataclasses import dataclass, field 

@dataclass
class NodeInfo:
    id:str
    node_data:Any



class GraphBiz:
    _graph_content = None
    _edge_cache:Dict[str, Dict[str, Any]] = {}
    _node_cache:Dict[str, NodeInfo] = {}
    _start_node = None
    _graph_id = None
    _graph_name = None
    def __init__(self, graph_id, graph_name, graph_content):
        self._graph_id = graph_id
        self._graph_name = graph_name
        self._graph_content = graph_content
        graph_map = json.load(self._graph_content)
        cells = graph_map['cells']
        self._parse(cells=cells)
        pass

    def _parse(self, cells):
        for cell in cells:
            shape = cell['shape']
            if 'edge' == shape:
                source_node = cell['source']['cell']
                target_node = cell['target']['cell']
                data = None
                if 'data' in cell:
                    data = cell[data]
                if source_node not in self._edge_cache:
                    self._edge_cache[source_node] = {}
                self._edge_cache[source_node][target_node] = data
            else:
                id = cell['id']
                data = None
                if 'data' in cell:
                    data = cell[data]
                
                node_data = None
                if data != None and 'nodedata' in data:
                    node_data = data['nodedata']
                componentTypeId = None
                if 'componentTypeId' in node_data:
                    componentTypeId = node_data['componentTypeId']
                if componentTypeId == 'start':
                    self._start_node = id
                node_info = NodeInfo(id=id, node_data=node_data)
                self._node_cache[id] = node_info

    def get_first_activite(self):
        if self._start_node == None:
            raise SystemError(f"没有找到画布{self._graph_name}")
        
        return self._node_cache[self._start_node]
        

    
    def get_next_activite(self, current_node_id:str, param:str):
        if current_node_id in self._edge_cache:
            next_nodes = self._edge_cache[current_node_id]
            first_key = next(iter(next_nodes))
            if None != first_key:
                self._node_cache[first_key]
            pass
        return None
        