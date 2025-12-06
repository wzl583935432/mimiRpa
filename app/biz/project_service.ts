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

    public async CreateNewProject(projectInfo:ProjectInfoDO) : Promise<ProjectInfoDO> {
        const conveyor = window.conveyor;
        const projectApi = conveyor.project
        const newProject = await projectApi.CreateNewProject(projectInfo);
        console.warn('newProject', newProject);
        return newProject;
    }

    public async createNewProjectVersion(projectId:string, projectVersion:string) : Promise<void> {
        const conveyor = window.conveyor;
        const projectApi = conveyor.project
        return await projectApi.CreateNewProjectVersion(projectId, projectVersion);
    }   
    


    

}
