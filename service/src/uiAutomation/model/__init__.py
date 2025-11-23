# 导入 c 包内部的 common_logic 模块
from .point import Point

# 1. 明确暴露公共函数
# 将 common_logic.py 中的函数直接导入到 c 包的命名空间下
from .request_element_data import RequestElementData
from .viewport_rect import ViewportRect
from .web_control import WebControl
from .web_target_element import WebTargetElementInFrame
from .call_info import CallInfo

# 2. 定义 __all__ 列表 (推荐，用于控制 from c import * 的行为)
# 这告诉 Python 当执行 'from c import *' 时，应该导入哪些名称
__all__ = [
    'call_info',
    "request_element_data",
    "viewport_rect", 
    "web_control", 
    "web_target_element", 
]

# 3. 版本信息 (可选，但推荐)
__version__ = "1.0.0"