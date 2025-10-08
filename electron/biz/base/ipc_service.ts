import { WebSocketServer, WebSocket } from "ws";
import { BaseMessage } from "@/lib/Model/IPC/baseMessage";

interface PromiseResult{
    timeout:number;
    resolve:(value:any)=>void;
    reject:(reason:any) =>void;
}

export class  IPCService{
    private static instance: IPCService;

    private constructor() {
    }

    // 静态公共方法，用于获取唯一的实例
    public static getInstance(): IPCService {
    // 检查实例是否已经存在，如果不存在则创建
    if (!IPCService.instance) {
        IPCService.instance = new IPCService();
    }
    return IPCService.instance;
    }

    private is_init:boolean = false;
    private wss:WebSocketServer = null;

    private createWebSocketServer(): Promise<WebSocketServer> {
        return new Promise((resolve, reject) => {
            const wss = new WebSocketServer({ port: 0 });
            wss.once("listening", () => resolve(wss));
            wss.once("error", reject);
        });
    }

    private waitCach:Record<string, PromiseResult> = {};

    public async waitConnect(subProcessId:string, timeout:number):Promise<WebSocket>{
        return new Promise((resolve, rejects) =>{
            const promiseResult = {
                timeout:timeout,
                resolve:resolve,
                reject:rejects
            }
            this.waitCach[subProcessId] = promiseResult;
            if(timeout >0)
            setTimeout(() => {
                delete this.waitCach[subProcessId];
                rejects("超时了")
            }, timeout);
        })

    }
    //初始化
    public async init():Promise<void>{
        if(this.is_init){
            return;
        }
        this.wss =  await this.createWebSocketServer();
        this.wss.on("connection", (ws) => {
            ws.once("message", (msg) => {
                try{
                    const messageObj = JSON.parse(msg.toString());
                   const  mobj =  messageObj as BaseMessage<string> 
                    if(!mobj){
                        throw new  Error("消息对象不正确")
                    }
                    const subProcessName = mobj.body;
                    
                    if(mobj.requestCode !== 'register')
                    {
                        throw new Error("首个消息应当为注册消息")
                    }
                    if(!subProcessName){
                        throw new Error("首个消息注册id不存在")
                    }

                    if(!this.waitCach[subProcessName]){
                        throw new Error("没有找到对于的进程处理");
                    } 
                    this.waitCach[subProcessName].resolve(ws);
                    delete this.waitCach[subProcessName]
                    const resultMessage:BaseMessage<string> = {
                        bizCode:"base",
                        messageId:mobj.messageId,
                        messageType:'response',
                        requestCode:"register",
                        returnCode:"SUC0000",
                        errorMessage:"",
                        body:''
                    }
                    const str = JSON.stringify(resultMessage);
                    ws.send(str);
                }catch(error){
                    let errorMessage = ""
                     if (error instanceof Error) {
                        errorMessage = error.message;
                    } else {
                        errorMessage = '未知错误';
                    }

                    const resultMessage:BaseMessage<string> = {
                        bizCode:"base",
                        messageId:'',
                        messageType:'response',
                        requestCode:"register",
                        returnCode:"Failed",
                        errorMessage:errorMessage,
                        body:''
                    }
                    const str = JSON.stringify(resultMessage);
                    ws.send(str);
                    ws.close()
                }
        
            });
        })
        this.is_init = true;

    }

    public GetPort():number
    {
        if(!this.wss){
            throw new Error("服务未初始化")
        }
        return  this.wss.address().port;
    }
}