from dataclasses import dataclass
from typing import List
from .viewport_rect import ViewportRect
@dataclass
class WebTargetFrame:
    def __init__(self, index:int, name:str, url:str):
        self.index = index
        self.name = name
        self.url = url
        pass
    index:int
    name:str
    url:str

@dataclass
class WebTargetElementInFrame:
    def __init__(self, tag_name:str, sibling_index:int, text:str, attr:List[str]):
        self.tag_name = tag_name
        self.sibling_index = sibling_index
        self.text = text
        self.attr = attr
        pass
    tag_name:str
    sibling_index:int
    text:str
    attr:List[str]


@dataclass
class WebTargetElement:
    def __init__(self, parent_frames:List[WebTargetFrame], chains:List[WebTargetElementInFrame], rect:ViewportRect):
        self.chains = chains
        self.parent_frames = parent_frames
        self.rect = rect
        pass
    parent_frames:List[WebTargetFrame]
    rect:ViewportRect
    chains:List[WebTargetElementInFrame]
