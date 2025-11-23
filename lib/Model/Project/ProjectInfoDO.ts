
export enum ProjectStatus{
    Enabled,
    Deleted
}

export enum ProjectVersionStatus{
    Editor,
    Published,
    Deleted
}

export interface ProjectVersionInfo{
    version:string,
    fromVersion:string| null|undefined;
    status:ProjectVersionStatus
}

export interface ProjectInfoDO{
    name:string,
    id:string,
    status:ProjectStatus,
    createTime:number,
    lastEditTime:number,
    createUser:string,
    description: string| null|undefined;
    versions:Array<ProjectVersionInfo> |null;

}
