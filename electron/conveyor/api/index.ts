import { electronAPI } from '@electron-toolkit/preload'
import { AppApi } from './app-api'
import { WindowApi } from './window-api'
import { ProjectApi} from './project_api'

export const conveyor = {
  app: new AppApi(electronAPI),
  window: new WindowApi(electronAPI),
  project: new ProjectApi(electronAPI),
}

export type ConveyorApi = typeof conveyor
