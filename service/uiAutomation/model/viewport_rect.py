from dataclasses import dataclass
from decimal import Decimal

@dataclass
class ViewportRect:
    def __init__(self, x:int, y:int , width:int, height:int, devicePixelRatio:Decimal|None):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.devicePixelRatio = devicePixelRatio
        pass
    x:int
    y:int
    width:int
    height:int
    devicePixelRatio:Decimal

