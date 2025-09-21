import {IProject} from '../../IProject'
import { ProjectInfoDO } from "@/lib/Model/Project/ProjectInfoDO";

export class ProjectImp implements IProject{
    GetProjectList(): Promise<ProjectInfoDO> {
        throw new Error('Method not implemented.');
    }

}