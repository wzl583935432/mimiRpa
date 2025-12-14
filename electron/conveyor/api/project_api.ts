import { ConveyorApi } from "@/electron/preload/shared";
import { ProjectInfoDO } from "@/lib/Model/Project/ProjectInfoDO";

export class ProjectApi extends ConveyorApi {
      QueryProjectList = () => this.invoke('project_query_list')
      CreateNewProject = (projectInfo:ProjectInfoDO) => this.invoke('project_create_new', projectInfo)
      CreateNewProjectVersion = (projectId:string, projectVersion:string) => this.invoke('project_create_new_version', projectId, projectVersion)
      QueryProjectVersionList = (projectId:string) => this.invoke('project_query_version_list', projectId)
      DeleteProject = (projectId:string) => this.invoke('project_delete', projectId)
      DeleteProjectVersion = (projectId:string, projectVersion:string) => this.invoke('project_delete_version', projectId, projectVersion)
      QueryGraphList = (projectId:string, projectVersion:string) => this.invoke('query_graph_list', projectId, projectVersion)
      QueryProjectGraphData = (projectId:string, projectVersion:string, graphId:string) => this.invoke('project_query_graph_data', projectId, projectVersion, graphId)
      QueryProjectMainGraphData = (projectId:string, projectVersion:string) => this.invoke('query_main_gragh_data', projectId, projectVersion)
      SaveProjectGraphData = (projectId:string, projectVersion:string, graphId:string, data:string) => this.invoke('project_save_graph_data', projectId, projectVersion, graphId, data)
      SaveNodeProperties = (projectId:string, projectversion:string, nodeId:string, properties:Record<string, string>) => this.invoke('save_node_properties', projectId, projectversion, nodeId , properties)
      QueryNodeProperties = (projectId:string, projectVersion:string, nodeId:string) => this.invoke('query_node_properties', projectId, projectVersion, nodeId)
}
