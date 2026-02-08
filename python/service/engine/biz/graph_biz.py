import json
from typing import Dict, Any
from dataclasses import dataclass, field 
from loguru import logger
from io import StringIO
from .variable_service import VaribleService
from .workflow_service import WorkflowService

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
        #logger.info(f"解析画布内容 {graph_content}")
        graph_map = json.loads(self._graph_content)
        cells = graph_map['cells']
        self._parse(cells=cells)
        pass

    def _parse(self, cells):
        for cell in cells:
            shape = cell['shape']
            if 'edge' == shape:
                logger.info(f"解析边 {cell}")
                source_node = cell['source']['cell']
                target_node = cell['target']['cell']
                data = None
                if 'data' in cell:
                    data = cell['data']
                if source_node not in self._edge_cache:
                    self._edge_cache[source_node] = {}
                logger.info(f"添加边 从 {source_node} 到 {target_node} 数据 {data}")
                self._edge_cache[source_node][target_node] = data
            else:
                id = cell['id']
                data = None
                if 'data' in cell:
                    data = cell['data']
                
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
        logger.info(f"获取节点 {current_node_id} 的后继节点")
        if current_node_id in self._edge_cache:
            next_nodes = self._edge_cache[current_node_id]
            logger.info(f"节点 {current_node_id} 的后继节点有 {next_nodes.keys()}")
            first_key = next(iter(next_nodes))
            if None != first_key:
                self._node_cache[first_key]
            pass
        return None
    
    def build_code(self) -> str:
        buf = StringIO() 
        if self._graph_id == 'main':
            VaribleService().get_instance().build_global_variable_code(buf)
        else:
            VaribleService().get_instance().build_global_variable_code(buf)
            VaribleService().get_instance().build_local_variable_code(buf, self._graph_id)

        buf.write("\n")
        buf.write("import asyncio\n")
        buf.write("from .componets_service import ComponetsService\n")
        buf.write("func_map = {} \n")

        for node_id, node_info in self._node_cache.items():
            self.build_node_code(buf, node_id)

        buf.write("\n")
        buf.write("async def run():\n")
        first_node = self.get_first_activite()
        if first_node == None:
            buf.write("    pass\n")
        else:
            buf.write(f"    # 从第一个节点开始执行\n")  
            buf.write(f"    g = GlobalVaribles()\n")
            buf.write(f"    l = LocalVaribles()\n")
            buf.write(f"    current_node_id = '{first_node.id}'\n")
            buf.write(f"    while(true)\n")
            buf.write(f"        result = await func_map['node_'+current_node_id](g=GlobalVaribles(), l=LocalVaribles())\n")
            buf.write(f"        current_node_id = get_next_node(current_node_id, componentTypeId, result)\n")
            buf.write(f"        if current_node_id is None:\n")
            buf.write(f"            break\n")
            buf.write(f"    pass\n")
            buf.write("\n")
        buf.write("if __name__ == '__main__':\n")
        buf.write("    asyncio.run(run())\n")
        return buf.getvalue()
        pass

    def get_next_nodes(self, current_node_id:str):
        if current_node_id in self._edge_cache:
            return self._edge_cache[current_node_id]
        return None

    def build_next_node_code(self, buf:StringIO):
        buf.write("# 构建后续节点代码\n")
        buf.write("def get_next_node(current_node_id, componentTypeId, result):\n")
        buf.write("    # 根据当前节点ID和组件类型以及结果来决定下一个节点\n")
        buf.write(f"    graph = WorkflowService().get_instance().get_graph('{self._graph_id}')\n")
        buf.write("    if graph is None:\n")
        buf.write("        raise ValueError('未找到图')\n")
        buf.write(f"    edge_cache = graph.get_next_nodes(current_node_id)\n")
        buf.write("    if edge_cache is None:\n")
        buf.write("        return None\n")
        buf.write("    if componentTypeId == 'switch' or componentTypeId == 'condition':\n")
        buf.write("        for key, val in edge_cache.items():\n")
        buf.write("            if result == val:\n")
        buf.write("                return key\n")
        buf.write("    else:\n")
        buf.write("        # 对于非条件节点，默认返回第一个后续节点\n")
        buf.write("        return next(iter(edge_cache.keys()))\n")




    def build_node_code(self, buf:StringIO, node_id:str):
        buf.write(f"# 节点 {node_id} 代码\n")
        buf.write("from .componets_service import ComponetsService\n")
        node_info = self._node_cache[node_id]
        buf.write(f"async def node_{node_id}(g, l):\n")
        buf.write(f"    # 获取组件类\n")
        buf.write(f"    componentTypeId = '{node_info.node_data['componentTypeId']}'\n")
        buf.write(f"    activity_cls = ComponetsService().get_instance().get_component(componentTypeId)\n")
        buf.write(f"    activity = activity_cls()\n")
        properties = WorkflowService().get_instance().get_node_properties(node_info.node_data['id'])
        for key, val in properties.items:
            if key == "result":
                continue
            buf.write(f"    activity.{key} = {val}\n")
        buf.write(f"    await activity.execute()\n")
        buf.write(f"    result = activity.result\n")
        if 'result' in properties:
            buf.write(f"    # 处理结果变量 {properties['result']}\n")
            buf.write(f"    {properties.get('result')} = result\n")
        buf.write(f"    return result\n")
        buf.write(f"func_map['node_{node_id}'] = node_{node_id} \n")


    def _build_variable_code(self, variable_name:str, variable_value:str):
        code = f"{variable_name} = {variable_value}"
        return code
        