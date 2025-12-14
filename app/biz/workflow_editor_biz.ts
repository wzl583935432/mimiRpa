import {NodePropertyEntity} from "@/electron/db/entity/node_property_entity"
import {WorkflowGraphEntity} from "@/electron/db/entity/workflow_graph_entity"

export class WorkflowEditorBiz {
  private projectId: string;
    private projectVersion:string;

    public constructor(projectId: string, projectVersion:string) {
        this.projectId = projectId;
        this.projectVersion = projectVersion;
    }

    public async getProjectMainGraph() :Promise<string>{
        const conveyor = window.conveyor;
        const projectApi = conveyor.project
        return await projectApi.QueryProjectMainGraphData(this.projectId, this.projectVersion);
    }

    public async queryGraphList(): Promise<Record<string,string>>{
        const conveyor = window.conveyor;
        const projectApi = conveyor.project
        return await projectApi.QueryGraphList(this.projectId, this.projectVersion);
    }

    //nodeId 其实是 graphId 如果nodeId为空，则表示主图片 如果不为空表示子图
    public async queryEditorGraphData(graphId:string) :Promise<WorkflowGraphEntity>{
        const conveyor = window.conveyor;
        const projectApi = conveyor.project
        return await projectApi.QueryProjectGraphData(this.projectId, this.projectVersion, graphId);
    }

    public async saveEditorGraphData(graphId:string, data:string) :Promise<boolean>{
        const conveyor = window.conveyor;
        const projectApi = conveyor.project
        return await projectApi.SaveProjectGraphData(this.projectId, this.projectVersion, graphId, data);
    }

    public async saveNodeProperties(nodeId:string, properties:Record<string, string>):Promise<boolean>{
        const conveyor = window.conveyor;
        const projectApi = conveyor.project
        return await projectApi.SaveNodeProperties(this.projectId, this.projectVersion, nodeId, properties);
    }

    public async QueryNodeProperties(nodeId:string) :Promise<Array<NodePropertyEntity>>{
        const conveyor = window.conveyor;
        const projectApi = conveyor.project
        return await projectApi.QueryNodeProperties(this.projectId, this.projectVersion, nodeId);
    }

}