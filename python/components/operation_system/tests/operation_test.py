from base.activity_manager import ActivityManager
from loguru import logger
from src.read_file_activity import ReadFileActivity

def test_get_all_activities():
    manager = ActivityManager()
    activities = manager.get_all_activities()
    
    logger.info(f"Discovered activities: {[activity.__name__ for activity in activities]}")
    assert len(activities) > 0

test_get_all_activities()
