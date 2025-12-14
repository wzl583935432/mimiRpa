import ComponentTypeDO from '@/lib/Model/Editor/ComponentTypeDO';

export class CanvasAreaBiz{
    private projectId:string
    private version:string
    private editorId:string
    private constructor(projectId:string, version:string, editorId:string) {
        this.projectId = projectId;
        this.version = projectId;
        this.editorId = editorId;
    }

    public async createNodeId(component:ComponentTypeDO, nodeId:string){


    }

    public async removeNodeId(nodeId:string){

        
    }

    /**
     * createdefaultProperties
     */
    private async createdefaultProperties(component:ComponentTypeDO) {
        
    }

    /**
     * getProperties
     */
    public getProperties(nodeId:string) {
        
    }

}