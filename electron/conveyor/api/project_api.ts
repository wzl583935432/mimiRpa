import { ConveyorApi } from "@/electron/preload/shared";
import { ProjectInfoDO } from "@/lib/Model/Project/ProjectInfoDO";

export class ProjectApi extends ConveyorApi {
      QueryProjectList = () => this.invoke('project_query_list')
      CreateNewProject = (projectInfo:ProjectInfoDO) => this.invoke('project_create_new', projectInfo)
}
