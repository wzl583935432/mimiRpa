from service.uiAutomation.ui_automation_select import UIAutomationSelect
import tkinter as tk
import json
import uiautomation as uia
from tk_window_manager  import TkWindowManager
import threading
import time

def draw_rect(rect, duration=3):
    """
    在桌面上绘制红色矩形边框，显示 duration 秒后消失
    rect: (x, y, width, height)
    """
    x, y, w, h = rect
    independent_win = tk.Toplevel()
    independent_win.overrideredirect(True)           # 去掉窗口边框
    independent_win.attributes("-topmost", True)     # 置顶显示
    independent_win.attributes("-transparentcolor", "white")  # 设置白色为透明
    independent_win.geometry(f"{w}x{h}+{x}+{y}")    # 设置窗口大小和位置

    canvas = tk.Canvas(independent_win, width=w, height=h, bg="white", highlightthickness=0)
    canvas.pack()

    # 绘制红色矩形边框，宽度为2
    canvas.create_rectangle(1, 1, w-1, h-1, outline="red", width=2)

    # 3秒后自动关闭
    independent_win.after(int(duration * 1000), independent_win.destroy)



def uia_serializer(obj):
    if isinstance(obj, uia.Control):  # Check if the object is a uiautomation Control (e.g., TextControl)
        return {
            "name": obj.Name,
            "automation_id": obj.AutomationId,
            "control_type": obj.ControlTypeName,
            "class_name": obj.ClassName,
            # Add other relevant attributes as needed
        }
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")


def dotest(name):
    au = UIAutomationSelect()
    x = 184
    y = 204

    #contr = au.getUIElementTargetByPoint(x,y)
    contr = au.getMouseUIElementTarget()
    #draw_rect((x, y, 5, 6), duration=3)
    print("Rect:", contr.BoundingRectangle)
    try:
        json_str = json.dumps(contr, default=uia_serializer, indent=4, ensure_ascii=False)
        print(json_str)
    except TypeError as e:
        print(f"Error: {e}")
    print(f" AutomationId: {contr.AutomationId   } , ControlTypeName:  {contr.ControlTypeName} ,Name: {contr.Name}"  )
    # 你的程序逻辑写在这里
    rect = contr.BoundingRectangle  # 返回 (left, top, right, bottom)

    left = rect.left
    top = rect.top
    right = rect.right
    bottom = rect.bottom

    width = right - left
    height = bottom - top

    draw_rect((left, top, width, height), duration=3)
    au.startSelectElementTarget()
    TkWindowManager().pushTaskToMain(14, dotest, '')
    pass

def doIndthro():
    time.sleep(5)
    au = UIAutomationSelect()
    au.startSelectElementTarget(None)
    #TkWindowManager().pushTaskToMain(0, dotest, '')
    pass

def main():

    t = threading.Thread(target=doIndthro, daemon=True)
    t.start()
    TkWindowManager().start()
    

if __name__ == "__main__":
    main()