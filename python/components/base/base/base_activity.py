from .field_annotation import FieldAnnotation, InputType
from typing import Annotated, get_type_hints, get_origin, get_args
from activity_node_info import ActivityNodeInfo, FieldInfo

class BaseActivity:
    result: Annotated[any, 
                      FieldAnnotation("结果",
                                   description="活动执行结果",
                                   input_type= InputType.Text,
                                   isvisible=True,
                                   isrequired=False, defaultvalue="")]
    display_name: Annotated[str, 
                           FieldAnnotation("节点名称",
                                        description="用户修改的节点名称",
                                        input_type= InputType.Text,
                                        isvisible=True,
                                        isrequired=True,  defaultvalue="")]
    original_name: Annotated[str, 
                           FieldAnnotation("组件名称",
                                        description="活动名称",
                                        input_type= InputType.Label,
                                        isvisible=True,
                                        isrequired=True,  defaultvalue="")]
    def __init__(self, name):
        self.display_name = name

    def before(self):
        print(f"Starting activity: {self.display_name}")

    def run(self):
        print(f"Running activity: {self.display_name}")

    def end(self):
        print(f"Stopping activity: {self.display_name}")
    
    @classmethod
    def get_node_info(cls) -> ActivityNodeInfo:
        node_info = ActivityNodeInfo()
        if(hasattr(cls, '_final_activity_decorate_path') and None != cls._final_activity_decorate_path):
            node_info.path = cls._final_activity_decorate_path.split("|")
        if(hasattr(cls, '_final_activity_decorate_name') and None != cls._final_activity_decorate_name):
            node_info.name = cls._final_activity_decorate_name
        if(hasattr(cls, '_final_activity_decorate_description') and None != cls._final_activity_decorate_description):
            node_info.description = cls._final_activity_decorate_description
        node_info.activity_class = cls.__name__
        node_info. fields = cls.get_fields()

        return node_info

    @classmethod
    def get_fields(cls)->list[FieldInfo]:
        fields = []
        # 遍历 MRO，从父类到子类
        for base in reversed(cls.__mro__):
            type_hints = get_type_hints(base, include_extras=True)
            for name, annotated_type in type_hints.items():
                if name in fields:
                    continue  # 子类字段覆盖父类字段
                field_info = FieldInfo()
                field_info.field_name = name
                origin = get_origin(annotated_type)
                metadata = None
                if origin is Annotated:
                    args = get_args(annotated_type)
                    typ = args[0]
                    for m in args[1:]:
                        if isinstance(m, FieldAnnotation):
                            metadata = m
                else:
                    typ = annotated_type

                if metadata is None:
                    # 如果字段没有 Annotated，创建默认 FieldAnnotation
                    metadata = FieldAnnotation(display_name=name)
                field_info.field_type = typ.__name__
                field_info.display_name = metadata.display_name
                field_info.description = metadata.description
                field_info.isvisible = metadata.isvisible
                field_info.isrequired = metadata.isrequired
                field_info.defaultvalue = metadata.defaultvalue
                field_info.direction = metadata.direction
                field_info.input_type = metadata.input_type

                fields.append(field_info)
        return fields