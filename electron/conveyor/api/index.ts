import { electronAPI } from '@electron-toolkit/preload'
import { AppApi } from './app-api'
import { WindowApi } from './window-api'
import { ProjectApi} from './project_api'
import { EditorApi } from './editor_api'
import { UIApi } from './ui-api'

export const conveyor = {
  app: new AppApi(electronAPI),
  window: new WindowApi(electronAPI),
  project: new ProjectApi(electronAPI),
  editor: new EditorApi(electronAPI),
  ui: new UIApi(electronAPI)
}

export type ConveyorApi = typeof conveyor
