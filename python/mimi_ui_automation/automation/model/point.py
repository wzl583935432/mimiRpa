from dataclasses import dataclass

@dataclass
class Point:
    def __init__(self, x:int, y :int):
        self.x = x
        self.y = y
        pass
    x:int
    y:int