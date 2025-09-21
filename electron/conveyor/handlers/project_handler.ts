import {ProjectService} from '@/electron/biz/project/project_service'
import { handle } from '@/electron/main/shared'

export const registerAppHandlers = (proService: ProjectService) => {
  // App operations
  handle('project_query_list', () => proService.getProjectList())
}
