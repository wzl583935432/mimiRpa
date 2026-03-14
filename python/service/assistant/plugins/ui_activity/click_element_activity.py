from base.base_activity import BaseActivity
from base.field_annotation import FieldAnnotation, InputType
from base.activity_exception import ActivityException
from base.final_activity_decorate import FinalActivityDecorate
from typing import Annotated, final
import os

@FinalActivityDecorate(path="UI自动化", name="点击元素")
class ClickElementActivity(BaseActivity):
    element_selector: Annotated[str,  
                      FieldAnnotation("元素选择器",
                                   description="要点击的元素选择器",
                                   input_type= InputType.TargetElement,
                                   isvisible=True,
                                   isrequired=True, defaultvalue="")] 

    def __init__(self):
        super().__init__()
        self.original_name = self._final_activity_decorate_name
        self.display_name = self._final_activity_decorate_name
        self.file_path = ""

    def before(self):
        return super().before()
    async def run(self):
        super().run()
        self.result = self.read()

    
    def end(self):
        return super().end()

    def read(self):
        content = f"点击了元素: {self.element_selector}"
        return content