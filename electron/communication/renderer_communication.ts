import { ipcRenderer } from 'electron';
import { CommunicationIpcRequest, CommunicationIpcResponse } from './message';

export class RendererComunication {
    private static instance: RendererComunication;
    private constructor() {

    }
    handles:Map<string, (args: any[]) => void> = new Map();
    public static getInstance(): RendererComunication {
        if (!RendererComunication.instance) {
            RendererComunication.instance = new RendererComunication();
        }
        return RendererComunication.instance;
    }

    public init(){
        ipcRenderer.on('main-to-renderer-message', (_: unknown, data) => {
                    
            if(this.handles.has(data.channel)){
                const handler = this.handles.get(data.channel);
                if(handler){
                    handler(data.args);
                }   
            }
            
            throw new Error(`No handler registered for channel: ${data.channel}`);
        });
    }

    public registRendererHandle(channel: string, handler: (args: any[]) => void){
     if(this.handles.has(channel)){
            throw new Error(`Channel ${channel} is already registered.`);
        }
        this.handles.set(channel, handler);
        // 这里可以初始化一些渲染进程的通信设置
    }

    public async send<T>(channel: string, ...args: any[]): Promise<T> {
        const messageId = Math.random().toString(36).substring(2, 15);
        const request: CommunicationIpcRequest = {
            messageId,
            channel,
            args
        };
        //
        const response = await ipcRenderer.invoke('renderer-to-main-message', request);
        const ipcResponse = response as CommunicationIpcResponse<T>;
        return ipcResponse.data;
    }

}