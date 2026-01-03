import componentTypeDO  from "@/lib/Model/Editor/ComponentTypeDO";
import ComponentPropertTypeDO from "@/lib/Model/Editor/ComponentPropertyTypeDO";
import NodeDO from "@/lib/Model/Editor/NodeDO";
import { AgentService } from "../base/agent_service";

enum InputType{
    Text = 1,
    TextArea = 2,
    Number = 3,
    Boolean = 4,
    Select = 5,
    Option = 6,
    File = 7,
    Label = 8,
    TargetElement = 9
}

enum DirectionType{
    In = 1,
    Out = 2
}



export class EditorService {
    private static instance: EditorService;
    private node_tree_cache: NodeDO[] | null = null;
    private component_types_cache: Record<string, componentTypeDO>| null = null;
    private list_components:any[] | null = null;
    private constructor() {
    }

    // 静态公共方法，用于获取唯一的实例
    public static getInstance(): EditorService {
        // 检查实例是否已经存在，如果不存在则创建
        if (!EditorService.instance) {
            EditorService.instance = new EditorService();
        }
        return EditorService.instance;
    }

    private cacheComponentsTypes(list_components): Record<string, componentTypeDO>| null {
        if(this.component_types_cache){
            return this.component_types_cache;
        }
        if(!list_components){
            return this.component_types_cache;
        }
        console.log("组件列表详情------", list_components);
        const componentTypes: Record<string, componentTypeDO> = {};
        for(const item of list_components){
            const compType: componentTypeDO = {
                id: item.class_name,
                originName: item.original_name,
                type: item.type,
                propertes: []
            };
            console.log("组件详情------", item.fields);
            for (const field of item.fields) {


                const fieldProperty:ComponentPropertTypeDO  = {
                    id: field.field_name,
                    name: field.display_name,
                    visiable: field.isvisible,
                    readonly: field.readonly,
                    isisrequired: field.isrequired,
                    defaultValue: field.defaultvalue,
                    description: field.description,
                    inputType: this.turnInputType(field.input_type),
                    type: this.turnFieldType(field.field_type),
                    options: field['options'] || [],
                    direction: field['direction'] || 0
                };
                console.log("组件属性详情------", fieldProperty);
                compType.propertes.push(fieldProperty);
                // 这里可以根据需要对 prop 进行进一步处理
            }
            componentTypes[item.class_name] = compType;
        }
        this.component_types_cache = componentTypes;
        return this.component_types_cache;
    };

    private turnInputType(input_type:InputType): string{
        switch(input_type){
            case InputType.Text:
                return "text";
            case InputType.Number:
                return "number";
            case InputType.TargetElement:
                return "targetElement";
            case InputType.Select:
                return "select";
            case InputType.TextArea:
                return "textarea";
            default:
                return "text";
        }
    }

    private turnFieldType(field_type:string): string{
        switch(field_type){
            case "str":
                return "string";
            case "int":
                return "number";
            case "float":
                return "number";
            case "bool":
                return "boolean";
            default:
                return "any";
        }
    }

    private cacheNodeTree(list_components): NodeDO[] | null {
        if(this.node_tree_cache){
            return this.node_tree_cache;
        }
        if(!list_components){
            return this.node_tree_cache;
        }   
        const treeData:NodeDO[] = [];

        for(const item of list_components){
            if(!item.path){

                const newItem:NodeDO = {
                    id: item.id,
                    componentType: item.class_name,
                    originName: item.original_name,
                    describe: item.description,
                    isLeaf: true,
                    children: null
                };
                treeData.push(newItem);
                continue;
            }
            let currentNode:NodeDO|undefined  = undefined;
            if(item.path){
                for(let i=0; i<item.path.length; i++){
                    if(!currentNode){
                        let rootNode:NodeDO|undefined = undefined;
                        rootNode = treeData.find(n => n.originName === item.path[0]);
                        if(!rootNode){
                            rootNode = { 
                                id: item.path[i],
                                componentType: 'folder',
                                originName: item.path[i],
                                isLeaf: false,
                                describe: "",
                                children: []
                            };
                            treeData.push(rootNode);
                        }
                        currentNode = rootNode;
                    }else{
                        let rootNode:NodeDO|undefined = undefined;
                        if(currentNode.children){
                            rootNode = currentNode.children.find(n => n.originName === item.path[0]);
                        }else{
                            currentNode.children = [];
                        }
                        if(!rootNode){
                            rootNode = { 
                                id: item.path[i],
                                componentType: 'folder',
                                originName: item.path[i],
                                isLeaf: false,
                                describe: "",
                                children: []
                            };
                            currentNode.children.push(rootNode);
                        }
                        currentNode = rootNode;
                    }
                }
            }
            const newItem:NodeDO = {
                    id: item.id,
                    componentType: item.class_name,
                    originName: item.original_name,
                    describe: item.description,
                    isLeaf: true,
                    children: null
                };
        
            if(currentNode){
                if(!currentNode.children){
                    currentNode.children = [];
                }   
                currentNode.children.push(newItem);
            }else{
                treeData.push(newItem);
            }

        }
        this.node_tree_cache = treeData;
        return this.node_tree_cache;
    }


    public async queryNodeTreeData() :Promise<NodeDO[]| null>{
        if(this.node_tree_cache){
            return this.node_tree_cache;
        }
        if(!this.list_components){
        
            this.list_components = await AgentService.getInstance().queryComponentsTree(10000);
        }
        this.cacheNodeTree(this.list_components);
        return this.node_tree_cache;
    }
    /*private async queryNodeTreeData():Promise<NodeDO[]>{
        const treeData = [
            {
                id: '0',
                componentType: 'folder',
                originName: '目录 A',
                isLeaf: false,
                describe:"这是目录A",
                children: [
                    { 
                        id: '0-0', 
                        componentType:'ui_get_element_text', 
                        originName: '获取元素文本', 
                        children: null,
                        isLeaf: true,
                        describe:"获取某个元素的文本内容"
                    },
                    { 
                        id: '0-1',
                        componentType:'ui_click_element',
                        originName: '点击元素',
                        children: null,
                        isLeaf: true ,
                        describe:"模拟点击某个元素"
                    },
                ],
            },
            {
                id: '1',
                componentType: 'folder',
                originName: '目录 B',
                isLeaf: false,
                describe:"这是目录B",
                children: [
                {
                    id: '1-0',
                    describe:"这是子目录 B-1",
                    componentType: 'folder',
                    originName: '子目录 B-1',
                    isLeaf: false,
                    children: [
                                {
                                    id: '1-0-0',
                                    componentType:'ui_get_element_attribut',
                                    originName: '获取元素属性',
                                    children: null,
                                    isLeaf: true,
                                    describe:"获取某个元素的属性值"
                                }
                            ],
                },
                ],
            },
            { 
                id: '2',
                componentType:'ui_input_element',
                originName: '输出到元素中',
                children: null,
                isLeaf: true,
                describe:"向某个输入框元素中输入文本"
            },
    ];
    return treeData;
    
    }*/


    public async queryComponentTypes() :Promise<Record<string, componentTypeDO>>{
        if(this.component_types_cache){
            return this.component_types_cache;
        }
        if(!this.list_components){
        
            this.list_components = await AgentService.getInstance().queryComponentsTree(10000);
        }
        this.cacheComponentsTypes(this.list_components);
        return this.component_types_cache??{};
        /*
        const componentTypes: Record<string, componentTypeDO> = {
            'ui_get_element_text': {
                id: 'ui_get_element_text',
                originName: '获取元素文本',
                type: 'action', // replace 'action' with the correct type if needed
                propertes: [
                    { id: 'elementSelector', name: '元素选择器', visiable:true, readonly:false, defaultValue: '', description: '用于定位目标元素的CSS选择器', inputType: 'text', type: 'string' },
                    { id: 'timeout', name: '超时时间', visiable:true, readonly:false, defaultValue: 5000, description: '等待元素出现的最大时间（毫秒）', inputType: 'text', type: 'number' },
                    { id: 'resultVariable', name: '结果变量名', visiable:true, readonly:false, defaultValue: 'elementText', description: '存储获取到的文本内容的变量名', inputType: 'text', type: 'string' },
                ]  // replace {} with the actual properties if needed
            },
            'ui_input_element': {
                id: 'ui_input_element', 
                originName: '输出到元素中',
                type: 'action', // replace 'action' with the correct type if needed
                propertes: [
                    { id: 'elementSelector', name: '元素选择器', visiable:true, readonly:false, defaultValue: '', description: '用于定位目标元素的CSS选择器', inputType: 'text', type: 'string' },
                    { id: 'timeout', name: '超时时间', visiable:true, readonly:false, defaultValue: 5000, description: '等待元素出现的最大时间（毫秒）', inputType: 'text', type: 'number' },
                    { id: 'resultVariable', name: '结果变量名', visiable:true, readonly:false, defaultValue: 'elementText', description: '存储获取到的文本内容的变量名', inputType: 'text', type: 'string' },
                ]   // replace {} with the actual properties if needed
            },
            'ui_click_element': {
                id: 'ui_click_element',
                originName: '点击元素', 
                type: 'action', // replace 'action' with the correct type if needed
                propertes: [
                    { id: 'elementSelector', name: '元素选择器', visiable:true, readonly:false, defaultValue: '', description: '用于定位目标元素的CSS选择器', inputType: 'text', type: 'string' },
                    { id: 'timeout', name: '超时时间', visiable:true, readonly:false, defaultValue: 5000, description: '等待元素出现的最大时间（毫秒）', inputType: 'text', type: 'number' },
                    { id: 'resultVariable', name: '结果变量名', visiable:true, readonly:false, defaultValue: 'elementText', description: '存储获取到的文本内容的变量名', inputType: 'text', type: 'string' },
                ]    // replace {} with the actual properties if needed
            },
            'ui_get_element_attribut': {    
                id: 'ui_get_element_attribut',
                originName: '获取元素属性', 
                type: 'action', // replace 'action' with the correct type if needed
                    propertes: [
                    { id: 'elementSelector', name: '元素选择器', visiable:true, readonly:false, defaultValue: '', description: '用于定位目标元素的CSS选择器', inputType: 'text', type: 'string' },
                    { id: 'timeout', name: '超时时间', visiable:true, readonly:false, defaultValue: 5000, description: '等待元素出现的最大时间（毫秒）', inputType: 'text', type: 'number' },
                    { id: 'resultVariable', name: '结果变量名', visiable:true, readonly:false, defaultValue: 'elementText', description: '存储获取到的文本内容的变量名', inputType: 'targetElement', type: 'string' },
                ]   // replace {} with the actual properties if needed
            },
        };

        return componentTypes;*/
    }
}