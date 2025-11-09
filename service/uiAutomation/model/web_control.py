from viewport_rect import ViewportRect
from dataclasses import dataclass

@dataclass
class WebControl:
    def __init__(self, cfg, vp:ViewportRect):
        self.config = cfg
        self.view_port = vp
        pass
    config = None
    view_port:ViewportRect