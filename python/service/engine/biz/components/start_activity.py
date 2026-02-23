from base.base_activity import BaseActivity
from base.field_annotation import FieldAnnotation, InputType
from base.activity_exception import ActivityException
from base.final_activity_decorate import FinalActivityDecorate
from typing import Annotated, final
from loguru import logger
import os

@FinalActivityDecorate(path="引擎|流程控制", name="开始流程")
class StartActivity(BaseActivity):
    def __init__(self):
        logger.info(f"Initializing StartActivity---{self._final_activity_decorate_name}")
        super().__init__()
        self.original_name = self._final_activity_decorate_name
        self.display_name = self._final_activity_decorate_name

    def before(self):
        logger.info(f"Before StartActivity")
        return super().before()
    async def run(self):
        super().run()
        self.result = True
    
    def end(self):
        return super().end()