import {registerWindowHandlers} from './window-handler'
import { registerAppHandlers } from './app-handler'
import { registerprojectHandlers } from './project_handler'
import { registerEditorHandlers } from './editor_handler'
import { registerUIHandlers } from './ui-handler'
import { registerEngineHandlers } from './engine-handler'

export const registerHandlers = (app, mainWindow)=>{
    registerWindowHandlers(mainWindow)
    registerAppHandlers(app)
    registerprojectHandlers()
    registerEditorHandlers()
    registerUIHandlers()
    registerEngineHandlers()
}