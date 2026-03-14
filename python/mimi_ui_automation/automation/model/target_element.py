
from dataclasses import dataclass

from loguru import logger

from .desktop_target_element import DesktopTargetElement

from .web_target_element import WebTargetElement

@dataclass
class TargetElement:
    type:str #元素类型，web或者desktop DesktopUI

    web_element_info:WebTargetElement #web元素信息，包含tag_name、id、class_name、xpath等
    desktop_element_info:DesktopTargetElement #元素信息，web元素包含tag_name、id、class_name、xpath等，desktop元素包含name、automation_id、control_type等
    
    
    def __init__(self):
        pass

        