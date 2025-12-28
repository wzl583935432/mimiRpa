from base.base_activity import BaseActivity
from base.field_annotation import FieldAnnotation, InputType
from base.activity_exception import ActivityException
from base.final_activity_decorate import FinalActivityDecorate
from typing import Annotated, final
import os

@FinalActivityDecorate(path="操作系统/文件", name="读取文件")
class ReadFileActivity(BaseActivity):
    file_path: Annotated[str,  
                      FieldAnnotation("文件路径",
                                   description="要读取的文件路径",
                                   input_type= InputType.File,
                                   isvisible=True,
                                   isrequired=True, defaultvalue="")] 

    def __init__(self, name):
        super().__init__(name)
        self.original_name = self._final_activity_decorate_name
        self.file_path = ""

    def before(self):
        return super().before()
    def run(self):
        super().run()
        self.result = self.read()

    
    def end(self):
        return super().end()

    def read(self):
        if os.path.isfile(self.file_path) == False:
            raise ActivityException(f"文件未找到: {self.file_path}", 'FILE_NOT_FOUND')

        with open(self.file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        return content