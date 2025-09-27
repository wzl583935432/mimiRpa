import {ProjectService} from '@/electron/biz/project/project_service'
import { handle } from '@/electron/main/shared'

export const registerprojectHandlers = () => {
  // App operations
  handle('project_query_list', () => ProjectService.getInstance().getProjectList())
}
