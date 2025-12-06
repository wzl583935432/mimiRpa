
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
    //nodeId 其实是 graphId 如果nodeId为空，则表示主图片 如果不为空表示子图
    public queryEditorGraphData(nodeId:string) :string{
        throw new Error("Method not implemented.");
    }

    public saveEditorGraphData(nodeId:string, data:string) :boolean{
        throw new Error("Method not implemented.");
    }

    public QueryNodeProperties(nodeId:string) :string{
        throw new Error("Method not implemented.");
    }

}