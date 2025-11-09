import uiautomation as uia
from pynput import mouse
import tkinter as tk
import time
from loguru import logger
import comtypes.client
import traceback
import threading

from web_ui_automation_select import WebUIAutomationSelect
from .model.web_control import WebControl

class UIAutomationSelect:
    _instance = None
    _lock = threading.Lock()
    #是否在选择中
    _is_run_select = False

    _current_draw_window = None

    _canvas = None

    _last_update_timestamp = 1

    _current_rect = None

    _mouse_listener = None

    _callback_func = None

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        self._is_run_select = False
        pass
    
    def start_select_element_target(self, callback_func):
        self._is_run_select = True
        self._callback_func = callback_func
        self._mouse_listener = mouse.Listener(
            on_click=self._on_click,
            on_move=self._on_move  # <--- 添加这一行
        )
        self._mouse_listener.start()

        pass

    def _finish_select_element_target(self, is_sucess, contrl):
        data ={}

        if self._callback_func:
            self._callback_func(is_sucess, data)
        pass

    def stopSelectElementTarget(self):
        self._is_run_select = False
        if self._mouse_listener:
            self._mouse_listener.stop()
            self._mouse_listener = None
        self.stop_draw_element()    
        pass

    def stop_draw_element(self):
        if self._current_draw_window:
            self._current_draw_window.destroy()
            self._current_draw_window = None
        if self._canvas:
            self._canvas = None
        pass

    def _redraw_control(self, contr):
        if not contr:
            return
        rect = contr.BoundingRectangle  # 返回 (left, top, right, bottom)
        left = rect.left
        top = rect.top
        right = rect.right
        bottom = rect.bottom

        width = right - left
        height = bottom - top

        self._current_rect = (left, top, width, height)
        self._draw_rect((left, top, width, height), duration=3)

    def _redraw_control_by_point(self, x, y):
        if (time.time() - self._last_update_timestamp < 0.2 ):
            return
        self._last_update_timestamp = time.time()
        if self._current_draw_window:
            self._current_draw_window.withdraw()
            #self._current_draw_window = None
        contr = self.getUIElementTargetByPoint(x, y)
        rect = contr.BoundingRectangle  # 返回 (left, top, right, bottom)
        web_control:WebControl|None  = WebUIAutomationSelect().in_which_web_control(contr, x, y)
        if None != web_control:
            print('--------------------------------------')
            self._draw_rect((round(web_control.view_port.x), round(web_control.view_port.y),round(web_control.view_port.width), round(web_control.view_port.height)), duration = -1)
            #todo web 选择
            pass
            return
        left = rect.left
        top = rect.top
        right = rect.right
        bottom = rect.bottom

        width = right - left
        height = bottom - top
        if(self._current_rect and  len(self._current_rect) == 4):
            if (self._current_rect[0] == left and 
                self._current_rect[1] == top and
                  self._current_rect[2] == width and
                    self._current_rect[3] == height):
                print(f"_draw_rect x {left}  y {top} w {width}, h {height}")
                self._current_draw_window.deiconify()
                return
            
        self._current_rect = (left, top, width, height)

        self._draw_rect((left, top, width, height), duration = -1)
        pass

    def _on_move(self, x, y):
        try:
            if (not self._is_run_select):
                return
            comtypes.CoInitialize()
            self._redraw_control_by_point(x, y)
            comtypes.CoUninitialize()
        except Exception as e:
            traceback.print_exc()
            print("select error ", e)
            pass
        pass
    
    def _on_click(self, x, y, button, pressed):
        if not pressed:
            return
        try:
            if button == mouse.Button.left:
                self.stopSelectElementTarget()
                contr = self.getUIElementTargetByPoint(x, y)
                if WebUIAutomationSelect().in_which_web_control(contr, x, y):
                    print('--------------------------------------')
                    #todo web 选择
                    pass
                else:
                    self._redraw_control(contr)
                self._finish_select_element_target(True, contr)
                #self._redraw_control_by_point(x, y)
                
            elif button == mouse.Button.right:
                # right click: stop watcher
                print("Right click received -> stopping watcher.")
                self._finish_select_element_target(False, None)
                self.stopSelectElementTarget()
        except Exception as e:
            logger.warning(e)

    def _draw_rect(self, rect, duration= 0):
        x, y, w, h = rect
        print(f"_draw_rect x {x}  y {y} w {w}, h {h}")
        if not self._current_draw_window:
            self._current_draw_window = tk.Toplevel()           
        else:
            self._current_draw_window.deiconify()
        self._current_draw_window.overrideredirect(True)           # 去掉窗口边框
        self._current_draw_window.attributes("-topmost", True)     # 置顶显示
        self._current_draw_window.attributes("-transparentcolor", "white")  # 设置白色为透明
        self._current_draw_window.geometry(f"{w}x{h}+{x}+{y}")    # 设置窗口大小和位置
        if self._canvas:
            self._canvas.destroy()
        self._canvas = tk.Canvas(self._current_draw_window, width=w, height=h, bg="white", highlightthickness=0)
        self._canvas.pack()

        # 绘制红色矩形边框，宽度为2
        self._canvas.create_rectangle(1, 1, w-1, h-1, outline="red", width=2)

        # 3秒后自动关闭
        if duration > 0:
           self._current_draw_window.after(int(duration * 1000), self.stop_draw_element)



    def getMouseUIElementTarget(self):
        # 获取鼠标当前位置
        x, y = uia.GetCursorPos()

        # 获取该位置对应的控件
        return self.getUIElementTargetByPoint(x, y)
        

    def getUIElementTargetByPoint(self, x ,y):
                # 获取该位置对应的控件
        ctrl = uia.ControlFromPoint(x, y)
        return ctrl
    pass