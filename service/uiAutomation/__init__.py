
from .tk_window_manager import  TkWindowManager
from .ui_automation_select import UIAutomationSelect

# 2. 定义 __all__ 列表 (推荐，用于控制 from c import * 的行为)
# 这告诉 Python 当执行 'from c import *' 时，应该导入哪些名称
__all__ = [
    "tk_window_manager",
    "ui_automation_select", 
]

# 3. 版本信息 (可选，但推荐)
__version__ = "1.0.0"