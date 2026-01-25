
from typing import Optional
from .graph_biz import GraphBiz
from typing import Dict, Any
from .graph_biz import NodeInfo
from .componets_service import ComponetsService
from .workflow_service import WorkflowService
class RunningPC:
    _graph_biz:GraphBiz = None
    _parent_running_pc:Optional['RunningPC'] = None

    _current_node:NodeInfo = None

    def __init__(self, parent_runing_pc:Optional['RunningPC'], graph_biz:GraphBiz):
        self._graph_biz = graph_biz
        self._parent_running_pc = parent_runing_pc
        pass

    

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

        if('start' == self._current_node.node_data['componentTypeId']):
            return self.run()
        
        commponent_cls = ComponetsService().get_instance().get_component(self._current_node.node_data['componentTypeId'])
        
        activity = commponent_cls()
        
        properties = WorkflowService().get_instance().get_node_properties(self._current_node.node_data['id'])
        for key, val in properties.items:
            if key == "result":
                continue
            value= exec(val, globals(), locals())
            setattr(activity, key, value)

        getattr(activity, 'result')
        pass
        