import { WorkflowGraphEntity } from "@/electron/db/entity/workflow_graph_entity";
import { NodePropertyEntity } from "@/electron/db/entity/node_property_entity";
import { AppService  } from "../app_service";
import path from "path";
import  Database  from 'better-sqlite3';
import type { Database as BetterSqlite3Database } from 'better-sqlite3'; 
import { WorkflowGraphTableAgent } from "@/electron/db/workflow_graph_table_agent";
import { NodePropertyTableAgent } from "@/electron/db/node_property_table_agent";
import { v4 as uuidv4 } from 'uuid'
import { UserService } from "../user_service";
import fs from "fs";

 
 // workflow_biz.ts 用于管理整个工作流相关的业务逻辑 工作流下面有多个编辑图 一个工作流存放在一个数据库文件中
 export class WorkFlowBiz {
    private projectId: string;
    private projectVersion:string;
    private db:BetterSqlite3Database | null = null;
    private isInitialized: boolean = false;

    private workflowGraphTableAgent:WorkflowGraphTableAgent | null = null;

    private NodePropertyTableAgent:NodePropertyTableAgent | null = null;

    constructor(projectId: string, projectVersion:string) {
        this.projectId = projectId;
        this.projectVersion = projectVersion;
    }
    
    public init(){
        if(this.isInitialized){
            return;
        }
        const workflows_base_dir = AppService.getInstance().getBaseProjectWorkflowDir();
        const project_workflow_dir = path.join(workflows_base_dir, this.projectId);
        if(!fs.existsSync( project_workflow_dir)){
            fs.mkdirSync( project_workflow_dir, { recursive: true });
        }
        const version_workflow_db_file = path.join(project_workflow_dir, `${this.projectVersion}.db`);
        this.db = new Database(version_workflow_db_file);
        this.isInitialized = true;
        this.workflowGraphTableAgent = new WorkflowGraphTableAgent(this.db);
        this.workflowGraphTableAgent.init();
        this.NodePropertyTableAgent = new NodePropertyTableAgent(this.db);
        this.NodePropertyTableAgent.init();


        // 初始化工作流相关的数据库连接等操作
    }

    public getMainEditorGraph():WorkflowGraphEntity{
        if(!this.db){
            throw new Error("Database not initialized.");
        }
        const workflow_graph_entity =  this.workflowGraphTableAgent?.getWorkflowGraphByNodeId("main");
        if(workflow_graph_entity){
            return workflow_graph_entity;
        }
        const createUser = UserService.getInstance().getCurrentUserId();
        const newMainGraph = new WorkflowGraphEntity(uuidv4(),
        "main",
        "主流程",
        "{}",
        "main",
        "",
        Date.now(),
        createUser ,
        Date.now());
        this.workflowGraphTableAgent?.saveOrUpdateWorkflowGraph(newMainGraph);
        return newMainGraph;
    }

    public createNewWorkflowGraph(name:string, 
        description:string, 
        nodeId:string, 
        parentGraphId:string):WorkflowGraphEntity{
        if(!this.db){
            throw new Error("Database not initialized.");
        }
        const createUser = UserService.getInstance().getCurrentUserId();
        const newGraph = new WorkflowGraphEntity(uuidv4(),
        name,
        description,
        "{}",
        nodeId,
        parentGraphId,
        Date.now(),
        createUser ,
        Date.now());
        this.workflowGraphTableAgent?.saveOrUpdateWorkflowGraph(newGraph);
        return newGraph;
    }


    public getWorkflowGraphByNodeId(nodeId:string):WorkflowGraphEntity | null{
        const workflow_graph_entity =  this.workflowGraphTableAgent?.getWorkflowGraphByNodeId(nodeId);
        if(workflow_graph_entity){
            return workflow_graph_entity;
        }
        return null;
    }

    public saveContentByNodeId(nodeId:string, content:string):boolean{
        return this.workflowGraphTableAgent?.saveContentByNodeId(nodeId, content) || false;
    }

    public getPropertiesByNodeId(nodeId:string):Array<NodePropertyEntity>{
        if(!this.db){
            throw new Error("Database not initialized.");
        }
        const  nodePropertyEntity = this.NodePropertyTableAgent?.getNodePropertiesByNodeId(nodeId);
        if(nodePropertyEntity){
            return nodePropertyEntity;
        } 
        // TODO 调用 NodePropertyAgent 获取节点属性
        return [];
    }

    public saveOrUpdateNodeProperty(entity:NodePropertyEntity):boolean{
        if(!entity.id){
            entity.id = uuidv4();
        }
        return this.NodePropertyTableAgent?.insertOrUpdateNodeProperty(entity) || false;
    }

    public removeNodeByNodeId(nodeId:string):boolean{
        const deleteGraphResult = this.workflowGraphTableAgent?.deleteWorkflowGraphByNodeId(nodeId) || false;
        const deletePropertiesResult = this.NodePropertyTableAgent?.deleteNodePropertiesByNodeId(nodeId) || false;
        return deleteGraphResult && deletePropertiesResult;
    }



    

}