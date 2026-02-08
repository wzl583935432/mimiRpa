
from typing import Optional
from .graph_biz import GraphBiz
from typing import Dict, Any
from .graph_biz import NodeInfo
from .componets_service import ComponetsService
from .workflow_service import WorkflowService
from .variable_service import VaribleService
from loguru import logger
class RunningPC:
    _graph_biz:GraphBiz = None
    _parent_running_pc:Optional['RunningPC'] = None

    _current_node:NodeInfo = None

    def __init__(self, parent_runing_pc:Optional['RunningPC'], graph_biz:GraphBiz):
        self._graph_biz = graph_biz
        self._parent_running_pc = parent_runing_pc
        pass

    async def run_activity(self, node:NodeInfo):
        logger.info(f"准备运行节点 {node.node_data['id']} 类型 {node.node_data['componentTypeId']}")
        if('start' == node.node_data['componentTypeId']):
            return None
        logger.info(f"运行节点 {node.node_data['id']} 类型 {node.node_data['componentTypeId']}")
        commponent_cls = ComponetsService().get_instance().get_component(node.node_data['componentTypeId'])
        
        activity = commponent_cls()
        
        properties = WorkflowService().get_instance().get_node_properties(node.node_data['id'])
        for key, val in properties.items:
            if key == "result":
                continue
            value= exec(val, globals(), locals())
            setattr(activity, key, value)

        await activity.execute()

        result = getattr(activity, 'result')

        result_variable = properties.get('result', None)
        if result_variable != None:
            if result_variable.startswith("g."):
                result_variable_name = result_variable.removeprefix("g.")
                VaribleService.get_instance().varibles['main'][result_variable_name] = result
            print(f"设置变量 {result_variable['variableName']} = {result}")
        if result_variable != None:
            exec(f"{result_variable['variableName']} = result", globals(), locals())

        return result

    async def run(self):
        if self._current_node == None:
            first_node =  self._graph_biz.get_first_activite()
            self._current_node = first_node
            if None == first_node:
                return
        else:
            if self._current_node == None:
                return
            self._current_node = self._graph_biz.get_next_activite(self._current_node.id,None)
        logger.info(f"当前节点 {self._current_node.id}")
        while self._current_node != None:
            result = await self.run_activity(self._current_node)
            self._current_node = self._graph_biz.get_next_activite(self._current_node.id, result)
        
        pass
        