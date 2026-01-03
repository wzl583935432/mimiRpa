from .field_annotation import FieldAnnotation, InputType
from typing import Annotated, get_type_hints, get_origin, get_args
from .activity_node_info import ActivityNodeInfo, FieldInfo

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
    def __init__(self):
        if(hasattr(self, '_final_activity_decorate_name') and None != self._final_activity_decorate_name):
           self.original_name = self._final_activity_decorate_name
        pass

    def before(self):
        print(f"Starting activity: {self.display_name}")

    def run(self):
        print(f"Running activity: {self.display_name}")

    def end(self):
        print(f"Stopping activity: {self.display_name}")
    
    @classmethod
    def get_node_info(cls) -> ActivityNodeInfo:
        
        path:list[str] = []
        if(hasattr(cls, '_final_activity_decorate_path') and None != cls._final_activity_decorate_path):
            path = cls._final_activity_decorate_path.split("|")
        name = "未知组件"
        if(hasattr(cls, '_final_activity_decorate_name') and None != cls._final_activity_decorate_name):
            name = cls._final_activity_decorate_name
        description = ""
        if(hasattr(cls, '_final_activity_decorate_description') and None != cls._final_activity_decorate_description):
            description = cls._final_activity_decorate_description
        activity_class = cls.__name__
        fields = cls.get_fields()
        node_info = ActivityNodeInfo(
            path=path,
            class_name=activity_class,
            description=description,
            original_name=name,
            fields=fields
        )
        return node_info

    @classmethod
    def get_fields(cls)->list[FieldInfo]:
        fields = []
        name_set = set()
        # 遍历 MRO，从父类到子类
        for base in reversed(cls.__mro__):
            type_hints = get_type_hints(base, include_extras=True)
            for name, annotated_type in type_hints.items():
                if name in name_set:
                    continue  # 子类字段覆盖父类字段
                name_set.add(name)
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
                field_info = FieldInfo( 
                    field_name= name,
                    display_name= metadata.display_name,
                    description= metadata.description,
                    isvisible= metadata.isvisible,
                    isrequired= metadata.isrequired,
                    defaultvalue= metadata.defaultvalue,
                    direction=metadata.direction,
                    input_type=metadata.input_type,
                    field_type= typ.__name__,
                    readonly= False,
                    options= metadata.options if hasattr(metadata, 'options') else []
                )
                fields.append(field_info)
        return fields