import { ProjectInfoDO } from "@/lib/Model/Project/ProjectInfoDO";
export interface IProject{
    GetProjectList():Promise<ProjectInfoDO>
}