

import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(current_dir, '..', '..')
sys.path.insert(0, project_root)

from agent_application import AgentApplication
import threading
from uiAutomation.web_ui_automation_select import WebUIAutomationSelect
from uiAutomation.tk_window_manager import TkWindowManager

def change_to_app_dir():
    """
    切换工作目录到当前程序所在目录（支持 PyInstaller 打包后）
    """
    if getattr(sys, 'frozen', False):  
        # ✅ 打包后的可执行文件
        app_path = os.path.dirname(sys.executable)
    else:
        # ✅ 普通脚本模式
        app_path = os.path.dirname(os.path.abspath(__file__))

    os.chdir(app_path)
    print("当前工作目录切换到:", os.getcwd())

def set_log():
    from loguru import logger
    logger.add(
        "logs/app_{time:YYYY-MM-DD}.log",
        rotation="1 day",
        retention="7 days",
        compression="zip",
        encoding="utf-8",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level:<8} | {name}:{function}:{line} - {message}"
    )


def main():
    change_to_app_dir()
    set_log()
    WebUIAutomationSelect().init_run()
    t = threading.Thread(target=AgentApplication().start, daemon=True)
    t.start()
    TkWindowManager().start()




if __name__ == "__main__":
    main()