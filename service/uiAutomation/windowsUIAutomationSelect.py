import uiautomation as uia

class WindowsUIAutomationSelect:
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