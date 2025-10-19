import { handle } from '@/electron/main/shared'
import {AgentService } from '@/electron/biz/base/agent_service'

export const registerUIHandlers = () => {
  // App operations
  handle('start_select_element', () => AgentService.getInstance().startSelectElement(-1)) ;
  handle('stop_select_element', () => AgentService.getInstance().stopSelectElement(1000)) ; 
}
