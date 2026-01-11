import { handle } from "@/electron/main/shared"
import {EngineService} from '@/electron/biz/base/engine_service'

export const registerEngineHandlers = () => {
  // App operations
  handle('runWorkflow', (fileName, params) => EngineService.getInstance().startWorkflow(fileName, params))
}
