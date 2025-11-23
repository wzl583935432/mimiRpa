class NodePropertyEntity {
    id: string;
    nodeId: string;
    propertyName: string;
    propertyValue: string;
    createTime: number;
    createUser: string;
    lastEditTime: number;
    isDefault: boolean;
    constructor(id: string,
        nodeId: string,
        propertyName: string,
        propertyValue: string,
        createTime: number,
        createUser: string,
        lastEditTime: number,
        isDefault: boolean) {
        this.id = id;
        this.nodeId = nodeId;
        this.propertyName = propertyName;
        this.propertyValue = propertyValue;
        this.createTime = createTime;
        this.createUser = createUser;
        this.lastEditTime = lastEditTime;
        this.isDefault = isDefault;
    }
}

export { NodePropertyEntity };