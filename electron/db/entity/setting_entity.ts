class SettingEntity {
    id: string
    key: string
    value: string
    createTime: number
    createUser: string
    lastEditTime: number
    constructor(id: string, key: string, value: string, createTime: number, createUser: string, lastEditTime: number) {
        this.id = id;
        this.key = key; 
        this.value = value;
        this.createTime = createTime;
        this.createUser = createUser;
        this.lastEditTime = lastEditTime;
    }   
}

export { SettingEntity };   