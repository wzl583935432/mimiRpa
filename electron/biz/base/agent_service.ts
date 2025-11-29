

import {IPCService} from './ipc_service'
import { spawn } from "child_process";
import { app } from 'electron';
import path from 'path';
import { WebSocket } from "ws";
import { BaseMessage } from "@/lib/Model/IPC/baseMessage";
import { v4 as uuidv4 } from 'uuid';
import log from 'electron-log'


interface AgentCallBack{
    messageID:string,
    timeout:number,
    resolve:(value:any)=>void;
    reject:(reason:any) =>void;
}

export class AgentService{
    private static instance: AgentService;

    private constructor() {
    }

    // 静态公共方法，用于获取唯一的实例
    public static getInstance(): AgentService {
        // 检查实例是否已经存在，如果不存在则创建
        if (!AgentService.instance) {
            AgentService.instance = new AgentService();
        }
        return AgentService.instance;
    }

    private isinit:boolean = false

    private ws: WebSocket|null = null ;
    
    private callbackCache:Record<string,AgentCallBack> = {};

    public async init(): Promise<void>
    {
        if(this.isinit)
            {
                return;
            }

        await IPCService.getInstance().init();
        const port = IPCService.getInstance().GetPort();
    
        const name = "agent";
        log.info(app.getAppPath())
        const pm = IPCService.getInstance().waitConnect(name, 10000);
        const filePath = path.join(app.getAppPath(), "service", "src", "assistant.py");
        log.info("应用目录:", filePath);

        let pythonExcutor = "python";
        if (process.platform === "win32") {
            pythonExcutor =  "python.exe";
        } else if (process.platform === "darwin") {
            pythonExcutor = "python3";
        } else {
            pythonExcutor = "python3";
        }
   
        // 启动 Python 程序
        const pyProcess = spawn(pythonExcutor, [filePath, `--port=${port}`, `--name=${name}`], {
            stdio: "pipe", // 捕获输出
        });
        this.isinit = true;
        // 监听标准输出
        pyProcess.stdout.on("data", (data) => {
            log.info(`Python 输出: ${data.toString().trim()}`);
        });

        // 监听错误输出
        pyProcess.stderr.on("data", (data) => {
            log.info(`Python 错误: ${data.toString().trim()}`);
        });

        // 监听进程退出
        pyProcess.on("close", (code) => {
            log.warn(` Python 进程退出，代码: ${code}`);
            this.isinit = false;
            this.callbackCache ={}
        });
        
        this.ws = await pm;
        if(!this.ws){
           throw new Error("创建的连接异常"); 
        }
        this.ws.on("message", (msg) => {
            const messageObj = JSON.parse(msg.toString());
            const  mobj =  messageObj as BaseMessage<any> 
            if(!mobj){
                throw new  Error("消息对象不正确")
            }
            if(mobj.messageType === "response"){
                console.log(mobj)
                const callbackInfo = this.callbackCache[mobj.messageId];
                console.log( this.callbackCache, callbackInfo)
                if(callbackInfo){
                    console.log('---------------------', mobj.body)
                    callbackInfo.resolve(mobj.body);
                }
                delete  this.callbackCache[mobj.messageId];
            }

        });

    }

    public async startSelectElement(timeout:number):Promise<any>{
        
        return new Promise((resolve, rejects) =>{
            const messageId = uuidv4();
            const callback:AgentCallBack = {
                messageID:messageId,
                timeout:timeout,
                resolve:resolve,
                reject:rejects
            }
            this.callbackCache[messageId] = callback;
            const msg:BaseMessage<string> ={
                bizCode:"select",
                requestCode:"select_element",
                messageId: messageId,
                messageType:"request",
            }
            const str = JSON.stringify(msg);
            this.ws.send(str);
            if(timeout >0){
                setTimeout(() => {
                delete this.callbackCache[messageId];
                rejects("超时了")
            }, timeout);
            }

        })
    }

    public async stopSelectElement(timeout:number):Promise<boolean>{

        return new Promise((resolve, rejects) =>{
            const messageId = uuidv4();
            const callback:AgentCallBack = {
                messageID:messageId,
                timeout:timeout,
                resolve:resolve,
                reject:rejects
            }
            console.log('messageId', messageId)
            this.callbackCache[messageId] = callback;
            const msg:BaseMessage<string> ={
                bizCode:"select",
                requestCode:"stop_select_element",
                messageId: messageId,
                messageType:"request",
            }
            const str = JSON.stringify(msg);
            this.ws.send(str);
            if(timeout >0){
                setTimeout(() => {
                delete this.callbackCache[messageId];
                rejects("超时了")
            }, timeout);
            }

        })
    }

    

}