
class WorkflowGraphEntity {
    id: string
    name: string
    description: string
    content: string
    nodeId: string
    parentGraphId: string
    createTime: number
    createUser: string
    lastEditTime: number
    constructor(id: string,
        name: string,
        description: string,
        content: string,
        nodeId:string, 
        parentGraphId:string, 
        createTime: number, 
        createUser: string, 
        lastEditTime: number) {
        this.id = id;
        this.name = name; 
        this.description = description;
        this.content = content;
        this.createTime = createTime;
        this.createUser = createUser;
        this.lastEditTime = lastEditTime;
        this.nodeId = nodeId;
        this.parentGraphId = parentGraphId;
    }   
}
export { WorkflowGraphEntity };