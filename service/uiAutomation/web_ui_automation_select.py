import psutil
import os
import json

class WebUIAutomationSelect:
    _instance = None

    web_config = {}

    web_content = {}

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def init_config():
        web_config ="web_config.json"
        config_content = '[{"name":"chrome", "port":10245}, {"name":"mimibrowser","port":10242}]'

        if os.path.exists(web_config):

            try:
                with open(web_config, 'r', encoding='utf-8') as f:
                    config_content = f.read()
                    # 2. 使用 json.load() 函数将文件句柄中的 JSON 数据加载到 Python 对象中
            except json.JSONDecodeError as e:
                print(f"错误: JSON 解析失败。请检查文件内容是否是有效的 JSON 格式。详细信息: {e}")
            except Exception as e:
                print(f"发生其他错误: {e}")
        data_list = json.load(config_content)
        web_config ={}
        for item in data_list:
            web_config[item['name']] = item
        pass


    def is_web_control(self, control):
        process_name = self._get_process_name(control)
        config = self.web_config[process_name]
        if not config:
            return False
         
        pass

    


    def _get_process_name(self, control):
        try:
            process = psutil.Process(control.ProcessId)
            process_name = process.name().lower()
            return process_name
        except Exception:
            pass
        return ""
        

    pass