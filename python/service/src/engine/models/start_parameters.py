from dataclasses import dataclass

@dataclass
class StartParameters:
    projectId:str
    projectVersion:str
    projectPath:str
    runningParameters:dict
    