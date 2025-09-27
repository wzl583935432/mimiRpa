import { ProjectInfoDO } from "@/lib/Model/Project/ProjectInfoDO";

export class ProjectService {
  private static instance: ProjectService;
    private constructor() {

    }
    public static getInstance(): ProjectService {
        if (!ProjectService.instance) {
            ProjectService.instance = new ProjectService();
        }
        return ProjectService.instance;
    }

    public async GetProjectList() : Promise<Array<ProjectInfoDO> > {
        const conveyor = window.conveyor;
        const projectApi = conveyor.project
        
        const projectList = await projectApi.QueryProjectList();
        console.warn('projectList', projectList);
        return projectList;
    }


}
