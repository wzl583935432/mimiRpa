from dataclasses import dataclass, field 
from .field_annotation import InputType, DirectionType
from typing import Any

@dataclass
class FieldInfo:
    field_name:str
    display_name: str
    description: str
    isvisible: bool
    isrequired: bool
    defaultvalue: any
    direction: DirectionType
    input_type: InputType
    field_type: str
    readonly: bool = False
    options: list[tuple[str, Any]] = field(default_factory=list)


@dataclass
class ActivityNodeInfo:
    path:list[str]
    class_name:str
    description:str
    original_name:str
    fields:list[FieldInfo] 
