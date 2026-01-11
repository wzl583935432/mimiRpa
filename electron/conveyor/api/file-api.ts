import { ConveyorApi } from '@/electron/preload/shared'

export class FileApi extends ConveyorApi {
  readFile = (fileName:string) => this.invoke('readFile', fileName)
  writeFile = (fileName:string, content:string) =>this.invoke('writeFile', fileName, content)
}
