import { type App } from 'electron'
import { handle } from '@/electron/main/shared'

export const registerAppHandlers = (app: App) => {
  // App operations
  handle('version', () => app.getVersion())
}
