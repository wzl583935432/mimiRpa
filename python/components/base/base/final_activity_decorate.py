class FinalActivityDecorate:
    name:str
    description:str
    def __init__(self, path="基础组件", name="INFO", description="最终活动装饰器"):
        self.path = path  # 接收装饰器参数
        self.name = name
        self.description = description

    def __call__(self, cls):
        cls._final_activity_decorate_is_final_ = True  # 给类添加一个属性，表示它是最终活动
        cls._final_activity_decorate_path = self.path
        cls._final_activity_decorate_name = self.name
        cls._final_activity_decorate_description = self.description
        return cls

