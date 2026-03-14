import uiautomation as uia
from dataclasses import dataclass
from loguru import logger
from typing import List, Dict, Any

@dataclass
class DesktopTargetElement:
    desktop_element_info:List[uia.Control]

    def __init__(self):
        pass