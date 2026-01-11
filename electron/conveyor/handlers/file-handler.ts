import { handle } from "@/electron/main/shared"
import {FileService} from '@/electron/biz/utilities/file_service'

export const registerFileHandlers = () => {
  // App operations
  handle('readFile', (fileName) => FileService.getInstance().readFile(fileName))
}
