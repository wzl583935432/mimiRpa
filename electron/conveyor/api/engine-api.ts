import { ConveyorApi } from '@/electron/preload/shared'

export class EngineApi extends ConveyorApi {
  startWorkflow = (workflowPath:string, parmas:any) => this.invoke('runWorkflow', workflowPath, parmas)
}
