//import { conveyor } from '@/electron/conveyor/api'

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

    public async GetProjectList(){
      //  const projectApi = conveyor.project
      //  return await projectApi.QueryProjectList();
    }

}
