class EditorLogEntity{
    id: number;
    actionType: string; // add, delete, update
    target:string; // 节点ID 或其他目标
    orginData:string; // 原始数据的JSON字符串
    newData:string; // 新数据的JSON字符串
    createTime: number;
    createUser: string; 
    constructor(id: number, actionType: string, target:string, orginData:string, newData:string, createTime: number, createUser: string) {
        this.id = id;
        this.actionType = actionType;
        this.target = target;
        this.orginData = orginData;
        this.newData = newData;
        this.createTime = createTime;
        this.createUser = createUser; 
    }
}

export { EditorLogEntity };