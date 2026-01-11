import { Engine } from './engine';
import { v4 as uuidv4 } from 'uuid';

export class EngineService {
    private static instance: EngineService;

    private constructor() {
    }

    // 静态公共方法，用于获取唯一的实例
    public static getInstance(): EngineService {
        // 检查实例是否已经存在，如果不存在则创建
        if (!EngineService.instance) {
            EngineService.instance = new EngineService();
        }
        return EngineService.instance;
    }

    private enginesCache:Record<string, Engine> = {};

    public async createEngine(workflowPath:string, params:any): Promise<string>{
        const workflowId:string = uuidv4();
        const engine = new Engine(workflowId, workflowPath, params)
        this.enginesCache[workflowId] = engine;
        await engine.init();
        return workflowId;
    }

    public async  startWorkflow(workflowPath:string, params:any){
        const workflowId = await this.createEngine(workflowPath, params);
        await this.enginesCache[workflowId].startEngine(10000)
        return  workflowId;
    }


}