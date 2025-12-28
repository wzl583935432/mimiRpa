from enum import Enum

class InputType(Enum):
    Text = 1
    TextArea = 2
    Number = 3
    Boolean = 4
    Select = 5
    Option = 6
    File = 7
    Label = 8

class DirectionType(Enum):
    In = 1
    Out = 2

# 1. 定义注解的元数据载体
class FieldAnnotation:
    display_name: str
    description: str
    isvisible: bool
    isrequired: bool
    defaultvalue: any
    direction: DirectionType
    input_type: InputType
    def __init__(self, display_name: str, description: str = "", isvisible: bool = True,
                 isrequired: bool = False, input_type: InputType = InputType.Text,
                 defaultvalue: any = None, direction: DirectionType = DirectionType.In):
        self.display_name = display_name
        self.description = description
        self.isvisible = isvisible
        self.input_type = input_type
        self.isrequired = isrequired
        self.defaultvalue = defaultvalue
        self.direction = direction  

    def __repr__(self):
        return f"FieldAnnotation(type={self.event_type}, p={self.priority})"

