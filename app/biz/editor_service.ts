
// EditorService.ts

import ComponentTypeDO from "@/lib/Model/Editor/ComponentTypeDO";
import { ElementTarget } from "@/lib/Model/Editor/ElementTarget";
import NodeDO from "@/lib/Model/Editor/NodeDO";

export class EditorService {
     private static instance: EditorService;
    private constructor() {

    }
    public static getInstance(): EditorService {
        if (!EditorService.instance) {
            EditorService.instance = new EditorService();
        }
        return EditorService.instance;
    }

    public async queryNodeTreeData() :Promise<NodeDO[]>{
        const conveyor = window.conveyor;
        const editor_api = conveyor.editor
        
        const nodeTree = await editor_api.queryNodeTreeData();
        console.warn('nodeTree', nodeTree);
        return nodeTree;
    }

    public async queryComponentTypes() :Promise<Record<string, ComponentTypeDO>>{
                const conveyor = window.conveyor;
        const editor_api = conveyor.editor
        
        const componentTypes = await editor_api.queryComponentTypes();
        console.warn('nodeTree', componentTypes);
        return componentTypes;
    }

    public async startSelectElement():Promise<ElementTarget>{
        throw new Error("not implement")
    }


}