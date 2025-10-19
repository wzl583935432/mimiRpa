import { BrowserWindow, shell, globalShortcut, app } from 'electron'
import { join } from 'path'
import appIcon from '@/resources/build/mimiRpa.Png?asset'
import { registerResourcesProtocol } from './protocols'
import { registerWindowHandlers } from '@/electron/conveyor/handlers/window-handler'
import { registerAppHandlers } from '@/electron/conveyor/handlers/app-handler'
import { registerprojectHandlers } from '@/electron/conveyor/handlers/project_handler'
import { registerEditorHandlers } from '../conveyor/handlers/editor_handler'
import {registerUIHandlers } from '../conveyor/handlers/ui-handler'
import { AgentService } from '../biz/base/agent_service'

export function createAppWindow(): void {
  // Register custom protocol for resources
  registerResourcesProtocol()

  // Create the main window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    backgroundColor: '#1c1c1c',
    icon: appIcon,
    frame: false,
    titleBarStyle: 'hiddenInset',
    title: 'mimi rpa',
    maximizable: true,
    resizable: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
    },
  })

  globalShortcut.register('F12', () => {
    mainWindow.webContents.openDevTools();
  });
  // Register IPC events for the main window.
  registerWindowHandlers(mainWindow)
  registerAppHandlers(app)
  registerprojectHandlers()
  registerEditorHandlers()
  registerUIHandlers()
  AgentService.getInstance().init();

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.openDevTools();
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
