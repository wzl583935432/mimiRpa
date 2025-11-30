import { ConveyorApi } from "@/electron/preload/shared";
import { ProjectInfoDO } from "@/lib/Model/Project/ProjectInfoDO";

export class ProjectApi extends ConveyorApi {
      QueryProjectList = () => this.invoke('project_query_list')
      CreateNewProject = (projectInfo:ProjectInfoDO) => this.invoke('project_create_new', projectInfo)
      CreateNewProjectVersion = (projectId:string, projectVersion:string) => this.invoke('project_create_new_version', projectId, projectVersion)
      QueryProjectVersionList = (projectId:string) => this.invoke('project_query_version_list', projectId)
      DeleteProject = (projectId:string) => this.invoke('project_delete', projectId)
      DeleteProjectVersion = (projectId:string, projectVersion:string) => this.invoke('project_delete_version', projectId, projectVersion)
      QueryProjectGraphData = (projectId:string, projectVersion:string, nodeId?:string) => this.invoke('project_query_graph_data', projectId, projectVersion, nodeId)
      QueryProjectMainGraphData = (projectId:string, projectVersion:string) => this.invoke('query_main_gragh_data', projectId, projectVersion)
      SaveProjectGraphData = (projectId:string, projectVersion:string, nodeId:string, data:string) => this.invoke('project_save_graph_data', projectId, projectVersion, nodeId, data)
}
