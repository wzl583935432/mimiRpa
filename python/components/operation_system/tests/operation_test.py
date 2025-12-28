from base.activity_manager import ActivityManager
from loguru import logger
from operation_activity.read_file_activity import ReadFileActivity
import json
from dataclasses import dataclass, asdict
from enum import Enum

def serialize_field_info(obj):
    # asdict 转换字典，json.dumps 转换字符串
    # default=str 用于处理枚举对象，将其转为字符串（或 obj.value）
    return json.dumps(asdict(obj), ensure_ascii=False, default=lambda o: o.value if isinstance(o, Enum) else str(o))


def test_get_all_activities():
    manager = ActivityManager()
    activities = manager.get_all_activities()
    if(len(activities) > 0):
        subclass = activities[0]
        obj = subclass.__new__(subclass)   # 创建实例但不调用 __init__
        obj.__init__()
        info = obj.get_node_info()  
        print(serialize_field_info(info))          
    logger.info(f"Discovered activities: {[activity.__name__ for activity in activities]}")
    assert len(activities) > 0

test_get_all_activities()
