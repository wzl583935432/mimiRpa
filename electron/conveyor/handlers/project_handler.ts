import {ProjectService} from '@/electron/biz/project/project_service'
import { handle } from '@/electron/main/shared'

export const registerprojectHandlers = () => {
  // App operations
  handle('project_query_list', () => ProjectService.getInstance().getProjectList())
  handle('project_create_new', (arg) => ProjectService.getInstance().CreateProject(arg))
  handle('project_query_version_list',() =>ProjectService.getInstance().getProjectList())
  handle('query_graph_list', (projectId, originVersion)=> ProjectService.getInstance().getPageList(projectId, originVersion))
  handle('project_create_new_version', 
    (projectId, originVersion) =>ProjectService.getInstance().createProjectVersion(projectId, originVersion))   
  handle('query_main_gragh_data', 
    (projectId, projectVersion) =>ProjectService.getInstance().queryProjectMainGraphContent(projectId, projectVersion))
  handle('project_save_graph_data', 
     (projectId, projectVersion, graphId, data) =>ProjectService.getInstance().saveProjectGraphData(projectId, projectVersion, graphId, data)
  )
  handle('project_query_graph_data', 
     (projectId, projectVersion, graphId) =>ProjectService.getInstance().queryProjectGraphData(projectId, projectVersion, graphId)
  )
  handle('save_node_properties',
    (projectId, projectVersion, nodeId, properties) =>ProjectService.getInstance().saveNodeProperties(projectId, projectVersion, nodeId, properties)
  )
  handle('query_node_properties',
    (projectId, projectVersion, nodeId) =>ProjectService.getInstance().getNodeProperties(projectId, projectVersion, nodeId)
  )
}
