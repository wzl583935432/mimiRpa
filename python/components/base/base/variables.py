import threading

class Variables:
    _global_variable:dict[str, any] = {}
    _graph_variable:dict[str, dict[str, any]] = {}
    _instance = None
    _lock = threading.Lock()  

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def getVariable(self, key: str, graph_id: str = None):
        if graph_id:
            if( graph_id not in self._graph_variable):
                if key in self._global_variable:
                    return self._global_variable[key]
                return None
            graph_vars = self._graph_variable.get(graph_id, {})
            return graph_vars.get(key, None)
        if key in self._global_variable:
            return self._global_variable[key]
        return None
    
    def setVariable(self, key: str, value: any, graph_id: str = None):
        if graph_id:
            if graph_id not in self._graph_variable:
                self._graph_variable[graph_id] = {}
            self._graph_variable[graph_id][key] = value
        else:
            self._global_variable[key] = value

    
    pass