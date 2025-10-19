import uiautomation as uia
from pynput import mouse
import tkinter as tk
import pythoncom
import time
from loguru import logger

class WindowsUIAutomationSelect:

    _is_run_select = False

    def __init__(self):
        self._is_run_select = False
        pass

    def draw_rect(rect, duration=3):
        """
        在桌面上绘制红色矩形边框，显示 duration 秒后消失
        rect: (x, y, width, height)
        """
        x, y, w, h = rect

        root = tk.Tk()
        root.overrideredirect(True)           # 去掉窗口边框
        root.attributes("-topmost", True)     # 置顶显示
        root.attributes("-transparentcolor", "white")  # 设置白色为透明
        root.geometry(f"{w}x{h}+{x}+{y}")    # 设置窗口大小和位置

        canvas = tk.Canvas(root, width=w, height=h, bg="white", highlightthickness=0)
        canvas.pack()

        # 绘制红色矩形边框，宽度为2
        canvas.create_rectangle(1, 1, w-1, h-1, outline="red", width=2)

        # 3秒后自动关闭
        root.after(int(duration * 1000), root.destroy)

        root.mainloop()
    def mouse_callback(self, nCode, wParam, lParam):
        pass

    def stopSelectElementTarget(self):
        self._is_run_select = False

        pass

    def startSelectElementTarget(self):
        if(self._is_run_select):
            return
        self._is_run_select = True

        pass

    def getMouseUIElementTarget(self):
        # 获取鼠标当前位置
        x, y = uia.GetCursorPos()

        # 获取该位置对应的控件
        return self.getUIElementTargetByPoint(x=x, y=y);
        

    def getUIElementTargetByPoint(self, x ,y):
                # 获取该位置对应的控件
        ctrl = uia.ControlFromPoint(x, y)
        return ctrl
    pass