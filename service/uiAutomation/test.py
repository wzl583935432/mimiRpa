from windowsUIAutomationSelect import WindowsUIAutomationSelect
def main():

    au = WindowsUIAutomationSelect()
    contr = au.getUIElementTargetByPoint(120,120)
    print(f" AutomationId: {contr.AutomationId   } , ControlTypeName:  {contr.ControlTypeName} ,Name: {contr.Name}"  )
    # 你的程序逻辑写在这里

if __name__ == "__main__":
    main()