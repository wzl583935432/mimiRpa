from dataclasses import dataclass
from typing import Optional

@dataclass
class TargetRect:
    x:int
    y:int
    w:int
    h:int

@dataclass
class TargetElement:
    Name:str
    AutomationId:str
    ControlType: str
    ClassName:str
    Rect: TargetRect
    SubTargetElement: Optional["TargetElement"] = None 