

import {IPCService} from './ipc_service'
import { spawn } from "child_process";
import { app } from 'electron';
import path from 'path';

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

    public async init(): Promise<void>
    {
        if(this.isinit)
            {
                return;
            }
        await IPCService.getInstance().init();
        const port = IPCService.getInstance().GetPort();
    
        const name = "agent";
        console.log(app.getAppPath())
        const pm = IPCService.getInstance().waitConnect(name, 10000);
        const filePath = path.join(app.getAppPath(), "service", "agent", "main.py");
        console.log("应用目录:", filePath);
   
        // 启动 Python 程序
        const pyProcess = spawn("python", [filePath, `--port=${port}`, `--name=${name}`], {
            stdio: "pipe", // 捕获输出
        });
        this.isinit = true;
        // 监听标准输出
        pyProcess.stdout.on("data", (data) => {
            console.log(`🐍 Python 输出: ${data.toString().trim()}`);
        });

        // 监听错误输出
        pyProcess.stderr.on("data", (data) => {
            console.error(`❌ Python 错误: ${data.toString().trim()}`);
        });

        // 监听进程退出
        pyProcess.on("close", (code) => {
            console.log(`✅ Python 进程退出，代码: ${code}`);
            this.isinit = false;
        });
        this.ws = await pm;

    }
    

}