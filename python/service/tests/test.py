import zipfile, sys
import os
from importlib.metadata import entry_points

class Test:
    def test_method(self):
        with zipfile.ZipFile("E:\GITHUB\mimiRpa\python\mimi_ui_automation\dist\mimi_ui_automation-1.0.0-py3-none-any.whl") as z:
            z.extractall("./plugins/plugin")
        sys.path.insert(0, "./plugins/plugin")


        for ep in entry_points(group="mimi.ui_automation"):
            plugin_cls = ep.load()
            plugin = plugin_cls()
            print('Loaded plugin:', plugin)
            plugin.run()
            

if __name__ == "__main__":
    test = Test()
    print(test.test_method())