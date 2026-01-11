import zipfile, sys
import os
from importlib.metadata import entry_points
import json
from dataclasses import asdict
from enum import Enum

class Test:
    def serialize_field_info(self, obj):
    # asdict 转换字典，json.dumps 转换字符串
    # default=str 用于处理枚举对象，将其转为字符串（或 obj.value）
        return json.dumps(asdict(obj), ensure_ascii=False, default=lambda o: o.value if isinstance(o, Enum) else str(o))

    def test_method(self):
        with zipfile.ZipFile("E:\GITHUB\mimiRpa\python\components\operation_system\dist\components_operation_system-1.0.0-py3-none-any.whl") as z:
            z.extractall("./plugins/plugin")
        sys.path.insert(0, "./plugins/plugin")


        for ep in entry_points(group="components.operation_system"):
            plugin_cls = ep.load()
            plugin = plugin_cls()
            print('Loaded plugin:', plugin)
            info = plugin.get_node_info()  
            print(self.serialize_field_info(info))      
            

if __name__ == "__main__":
    test = Test()
    test.test_method()