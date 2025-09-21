import { ConveyorApi } from '@/electron/preload/shared'

export class AppApi extends ConveyorApi {
  version = () => this.invoke('version')
}
