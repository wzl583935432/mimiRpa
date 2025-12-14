
// EditorService.ts

import ComponentTypeDO from "@/lib/Model/Editor/ComponentTypeDO";
import NodeDO from "@/lib/Model/Editor/NodeDO";

export class ComponentService {
    private static instance: ComponentService;
    private constructor() {

    }
    public static getInstance(): ComponentService {
        if (!ComponentService.instance) {
            ComponentService.instance = new ComponentService();
        }
        return ComponentService.instance;
    }
    /**
     * 获取编辑的节点树
     * @returns 
     */
    public async queryNodeTreeData() :Promise<NodeDO[]>{
        const conveyor = window.conveyor;
        const editor_api = conveyor.editor
        
        const nodeTree = await editor_api.queryNodeTreeData();
        console.warn('nodeTree', nodeTree);
        return nodeTree;
    }
    /**
     * 获取组件的属性
     * @returns 
     */
    public async queryComponentTypes() :Promise<Record<string, ComponentTypeDO>>{
        const conveyor = window.conveyor;
        const editor_api = conveyor.editor
        
        const componentTypes = await editor_api.queryComponentTypes();
        console.warn('nodeTree', componentTypes);
        return componentTypes;
    }

}