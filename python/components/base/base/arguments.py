import threading

class Arguments:
    _arg:dict[str, any] = {}
    _instance = None
    _lock = threading.Lock()  

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance
    def setAllArguments(self, args: dict[str, any]):
        self._arg = args
        pass
    def setArgument(self, key: str, value: any):
        self._arg[key] = value
        pass
    def getArgument(self, key: str):
        return self._arg.get(key, None)
    def getAllArguments(self):
        return self._arg