import {IPCService, ServiceCallBack} from './ipc_service'
import { spawn } from "child_process";
import { app } from 'electron';
import path from 'path';
import { WebSocket } from "ws";
import { BaseMessage } from "@/lib/Model/IPC/baseMessage";
import log from 'electron-log'
import { v4 as uuidv4 } from 'uuid';

export class Engine{
    private isinit:boolean = false
    private flowId:string ="";
    private workflowPath:string =""
    private params:any
    private ws: WebSocket|null = null ;
    private callbackCache:Record<string,ServiceCallBack> = {};

    public constructor(flowId:string, workflowPath:string, params:any) {
        this.flowId = flowId;
        this.workflowPath = workflowPath;
        this.params = params
    }


    public async init(): Promise<void>
    {
        if(this.isinit)
        {
            return;
        }

        await IPCService.getInstance().init();
        const port = IPCService.getInstance().GetPort();
    
        const name = "engine_"+ this.flowId;
        log.info(app.getAppPath())
        const pm = IPCService.getInstance().waitConnect(name, 10000);
        const filePath = path.join(app.getAppPath(),"python", "service", "engine.py");
        log.info("应用目录------:", filePath);
        
        let pythonExcutor = "python";
        if (process.platform === "win32") {
            pythonExcutor =  "python.exe";
        } else if (process.platform === "darwin") {
            pythonExcutor = "python3";
        } else {
            pythonExcutor = "python3";
        }

        const pythonRoot = path.join(app.getAppPath(), "python");
        const env = {
        ...process.env,
        PYTHONPATH: pythonRoot
        };
    
        // 启动 Python 程序
        const pyProcess = spawn(pythonExcutor, 
            ['-m', "service.engine", `--port=${port}`, `--name=${name}`],
            { cwd: pythonRoot, env });
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
        log.info(` ws 创建中`);
        this.ws = await pm;
        log.info(` ws 创建成功`);
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
                log.info('message----', mobj)
                const callbackInfo = this.callbackCache[mobj.messageId];
                log.info( this.callbackCache, callbackInfo)
                if(callbackInfo){
                    log.info('----------message-----------', mobj.body)
                    callbackInfo.resolve(mobj.body);
                }
                delete this.callbackCache[mobj.messageId];
            }

        });

    }

    public async startEngine(timeout:number):Promise<any>{
        
        return new Promise((resolve, rejects) =>{
            const messageId = uuidv4();
            const callback:ServiceCallBack = {
                messageID:messageId,
                timeout:timeout,
                resolve:resolve,
                reject:rejects
            }

            const body = {
                "workflow":this.flowId,
                "workflowPath":this.workflowPath,
                "params": this.params
            }
            
            this.callbackCache[messageId] = callback;
            const msg:BaseMessage<any> ={
                bizCode:"engine",
                requestCode:"start_workflow",
                messageId: messageId,
                messageType:"request",
                body:body
            }
            const str = JSON.stringify(msg);
            log.info('---------------', str)
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