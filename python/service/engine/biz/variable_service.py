import threading
from typing import Dict, Any
from io import StringIO
from dataclasses import dataclass

@dataclass
class VariableInfo:
    variable_name:str
    variable_type:str
    variable_value:Any


class VaribleService:
    _instance = None
    _lock = threading.Lock()  
    global_arguments: Dict[str, VariableInfo] = {}
    global_varibles: Dict[str, VariableInfo] = {}
    local_varibles: Dict[str, Dict[str, VariableInfo]] = {}
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
    
    def get_global_variable(self, variable_name:str):
        return self.global_varibles.get(variable_name, None)
    
    def build_global_variable_code(self, buf:StringIO) -> StringIO:
        buf.write("# 全局变量\n")
        buf.write("from dataclasses import dataclass\n")
        buf.write("@dataclass\n")
        buf.write("class GlobalVaribles:\n")
        buf.write("    # 这里定义全局变量\n")
        buf.write("    __default_dict__ = {}\n")

        for variable_name, variableInfo in self.global_varibles.items():
            buf.write(f"    {variable_name}:{variableInfo.variable_type} = {variableInfo.variable_value} \n")
        buf.write("\n")
        return buf


        
    def build_local_variable_code(self, buf:StringIO , graph_id:str) -> StringIO:
        buf.write("# 局部变量\n")
        buf.write("@dataclass\n")
        buf.write("class LocalVaribles:\n")
        buf.write("    # 这里定义局部变量\n")
        buf.write("    __default_dict__ = {}\n")
        current_graph_local_varibles = self.local_varibles.get(graph_id, {})
        if current_graph_local_varibles is not None:
            for variable_name, variableInfo in current_graph_local_varibles.items():
                buf.write(f"    {variable_name}:{variableInfo.variable_type} = {variableInfo.variable_value} \n")

        buf.write("\n")
        return buf