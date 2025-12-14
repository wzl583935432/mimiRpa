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
 export class WorkflowBiz {
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
        console.log("数据库路径：", version_workflow_db_file)
        this.db = new Database(version_workflow_db_file);
        this.isInitialized = true;
        this.workflowGraphTableAgent = new WorkflowGraphTableAgent(this.db);
        this.workflowGraphTableAgent.init();
        console.log('NodePropertyTableAgent')
        this.NodePropertyTableAgent = new NodePropertyTableAgent(this.db);
        this.NodePropertyTableAgent.init();


        // 初始化工作流相关的数据库连接等操作
    }

    public createMainEdtorGraph():WorkflowGraphEntity{
        if(!this.db){
            throw new Error("Database not initialized.");
        }
        const workflow_graph_entity =  this.workflowGraphTableAgent?.getWorkflowGraphById("main");
        if(workflow_graph_entity){
            return workflow_graph_entity;
        }
        const createUser = UserService.getInstance().getCurrentUserId();
        const newMainGraph = new WorkflowGraphEntity(uuidv4(),
        "main",
        "主流程",
        "{}",
        Date.now(),
        createUser ,
        Date.now());
        this.workflowGraphTableAgent?.saveOrUpdateWorkflowGraph(newMainGraph);
        return newMainGraph;
    }

    public getMainEditorGraph():WorkflowGraphEntity{
        if(!this.db){
            throw new Error("Database not initialized.");
        }
        const workflow_graph_entity =  this.workflowGraphTableAgent?.getWorkflowGraphById("main");
        if(workflow_graph_entity){
            return workflow_graph_entity;
        }
        return this.createMainEdtorGraph()
    }

    public getGraphList():Record<string, string>{
        if(!this.db){
            throw new Error("Database not initialized.");
        }
        if(!this.workflowGraphTableAgent){
            throw new Error("database agent not initilized");
        }
        return this.workflowGraphTableAgent.getWorkflowGraphList();
    }


    public createNewWorkflowGraph(name:string, 
        description:string):WorkflowGraphEntity{
        if(!this.db){
            throw new Error("Database not initialized.");
        }
  
        const createUser = UserService.getInstance().getCurrentUserId();
        const newGraph = new WorkflowGraphEntity(uuidv4(),
        name,
        description,
        "{}",
        Date.now(),
        createUser ,
        Date.now());
        this.workflowGraphTableAgent?.saveOrUpdateWorkflowGraph(newGraph);
        return newGraph;
    }


    public getWorkflowGraphById(graphId:string):WorkflowGraphEntity | null{
        const workflow_graph_entity =  this.workflowGraphTableAgent?.getWorkflowGraphById(graphId);
        if(workflow_graph_entity){
            return workflow_graph_entity;
        }
        return null;
    }

    public saveContentById(id:string, content:string):boolean{
        console.log('保存的数据', content)
        const isok = this.workflowGraphTableAgent?.saveContentById(id, content) || false;
        if (!isok){
            const createUser = UserService.getInstance().getCurrentUserId();
            const entity: WorkflowGraphEntity = 
            new WorkflowGraphEntity(id,
                id === 'main'?'main':'重建',
                id === 'main'?'主流程':'',
                content, Date.now(), createUser ,
                Date.now()) ;
            console.log('重建的数据-----', this.workflowGraphTableAgent)
            return  this.workflowGraphTableAgent?.saveOrUpdateWorkflowGraph(entity)|| false;
        }
        console.log('保存的数据-----', isok)
        return isok;
       
    }



    public saveOrUpdateNodeProperty(entity:NodePropertyEntity):boolean{
        if(!entity.id){
            entity.id = uuidv4();
        }
        return this.NodePropertyTableAgent?.insertOrUpdateNodeProperty(entity) || false;
    }

    public removeNodeByNodeId(graphId:string):boolean{
        const deleteGraphResult = this.workflowGraphTableAgent?.deleteWorkflowGraphById(graphId) || false;
        const deletePropertiesResult = this.NodePropertyTableAgent?.deleteNodePropertiesByNodeId(graphId) || false;
        return deleteGraphResult && deletePropertiesResult;
    }

    public saveProperties(nodeId:string, properties:Record<string,string>):boolean{
        const createUser = UserService.getInstance().getCurrentUserId();
        for (const [key, value] of Object.entries(properties)) {
           const entitiy: NodePropertyEntity  = new NodePropertyEntity(uuidv4(),
            nodeId,
            key,
            value,
            Date.now(),
            createUser ,
            Date.now(),
            true
           );
           this.NodePropertyTableAgent?.insertOrUpdateNodeProperty(entitiy);
        }
        return true
    }

    public getPropertiesById(nodeId:string):Array<NodePropertyEntity>{
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


    

}