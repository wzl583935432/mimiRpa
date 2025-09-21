import { BrowserWindow, ipcMain } from 'electron';
import { CommunicationIpcRequest } from './message';
export class MainCommunication {
    private static instance: MainCommunication;
    private constructor() {

    }
    public static getInstance(): MainCommunication {
        if (!MainCommunication.instance) {
            MainCommunication.instance = new MainCommunication();
        }
        return MainCommunication.instance;
    }
    handles:Map<string, (args: any[]) => Promise<any>> = new Map();
    public init(){
        ipcMain.handle('renderer-to-main-message', (_: unknown, data) => {
        
        if(this.handles.has(data.channel)){
            const handler = this.handles.get(data.channel);
            if(handler){
                return handler(data.args);
            }   
        }
        
        throw new Error(`No handler registered for channel: ${data.channel}`);
        });
    }
    
    public registerMainHandle(channel: string, handler: (args: any[]) => Promise<any>){
        if(this.handles.has(channel)){
            throw new Error(`Channel ${channel} is already registered.`);
        }
        this.handles.set(channel, handler);
    }

    public  send(win:BrowserWindow, channel: string, ...args: any[]) {
        const messageId = Math.random().toString(36).substring(2, 15);
        const request: CommunicationIpcRequest = {
            messageId,
            channel,
            args
        };
        win.webContents.send('main-to-renderer-message', request);
    }
    

} 