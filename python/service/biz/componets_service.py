import threading
from pathlib import Path 
from .setting_service import SettingService
import zipfile
import os
import sys
import json
from dataclasses import asdict
from enum import Enum
from importlib.metadata import entry_points

class ComponetsService:
    _instance = None
    _lock = threading.Lock()  
    route = {}
    ws_context = None
    _whl_files:list = []
    b_initialized = False

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def get_instance(self):
        return self._instance
    
    def _whl_path_to_group(self, whl_path: str | Path) -> str:
        """
        将 whl 文件路径转换为 entry point group 名称
        
        示例:
            "C:/path/components_operation_system-1.0.0-py3-none-any.whl"
            -> "components.operation.system"
        """
        whl_path = Path(whl_path)
        
        if not whl_path.exists():
            raise FileNotFoundError(f"File not found: {whl_path}")
        
        if whl_path.suffix != ".whl":
            raise ValueError(f"Not a .whl file: {whl_path}")
        
        # 取文件名去掉 .whl
        stem = whl_path.stem  # e.g., "components_operation_system-1.0.0-py3-none-any"

        # 去掉版本及 py 标签
        name_part = stem.split('-')[0]  # "components_operation_system"

        # 下划线转成点
        group_name = name_part.replace('_', '.', 1)

        return group_name
    
    def _serialize_field_info(self, obj):
        def convert(o):
            if isinstance(o, Enum):
                return o.value
            return o

        return asdict(obj, dict_factory=lambda items: {
            k: convert(v) for k, v in items
        })

    def _load_component_whl(self):
        if self.b_initialized:
            return
        component_path = SettingService().get_instance().get_componets_path()
        print(component_path)
        if( not Path(component_path).exists()):
            print("组件路径不存在")
            return
        app_path = SettingService().get_instance().get_app_path()
        plugins = os.path.join(app_path, "plugins")
        sys.path.insert(0, plugins)

        files = list(Path(component_path).glob("*.whl"))
        for file in files:
            print(file)      
            with zipfile.ZipFile(file=file) as z:
                z.extractall(plugins)
        self._whl_files = files
        self.b_initialized = True
        print("组件加载完成")

    def query_components(self)-> list:
        self._load_component_whl()
        files = self._whl_files
        properties = []
        for file in files:
            #print(file)
            group = self._whl_path_to_group(file)
            print(f"组件 {file} 对应的 entry point group 为: {group}")
            # 获取所有 entry points
            for ep in entry_points(group=group):
                plugin_cls = ep.load()
                plugin = plugin_cls()
                print('Loaded plugin:', plugin)
                info = plugin.get_node_info()  
                properties.append(self._serialize_field_info(info))
                print(self._serialize_field_info(info))      
        return properties