import {ProjectService} from '@/electron/biz/project/project_service'
import { handle } from '@/electron/main/shared'

export const registerprojectHandlers = () => {
  // App operations
  handle('project_query_list', () => ProjectService.getInstance().getProjectList())
  handle('project_create_new', (arg) => ProjectService.getInstance().CreateProject(arg))
  handle('project_query_version_list',() =>ProjectService.getInstance().getProjectList())
  handle('project_create_new_version', 
    (projectId, originVersion) =>ProjectService.getInstance().createProjectVersion(projectId, originVersion))   
  handle('query_main_gragh_data', 
    (projectId, projectVersion) =>ProjectService.getInstance().queryProjectMainGraphContent(projectId, projectVersion))


}
