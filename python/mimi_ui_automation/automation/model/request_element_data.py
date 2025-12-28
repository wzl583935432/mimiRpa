from dataclasses import dataclass
from .viewport_rect import ViewportRect
from .point import Point

@dataclass
class RequestElementData:
    def __init__(self, vp:ViewportRect, point:Point):
        self.view_port = vp
        self.target_point = point
        pass
    view_port:ViewportRect
    target_point:Point