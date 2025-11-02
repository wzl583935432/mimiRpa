import threading
import tkinter as tk

#tk ui 是主要的tk
class TkWindowManager:
    _instance = None
    _lock = threading.Lock()  
    __root = None

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def start(self):
        self.__root = tk.Tk()
        self.__root.withdraw()
        self.__root.mainloop()
        pass
    
    
    def pushTaskToMain(self, ms, func=None, *args):
        self.__root.after(ms, func, args)
        pass

    def getRoot(self):
        return self.__root

    def stop(self):
        pass