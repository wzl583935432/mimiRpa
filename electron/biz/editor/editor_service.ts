import componentTypeDO from "@/lib/Model/Editor/ComponentTypeDO";
import NodeDO from "@/lib/Model/Editor/NodeDO";
import { AgentService } from "../base/agent_service";

export class EditorService {
    private static instance: EditorService;

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

    


    public async queryNodeTreeData() :Promise<NodeDO[]>{

        return await AgentService.getInstance().queryComponentsTree(10000);
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
    
    }


    public async queryComponentTypes() :Promise<Record<string, componentTypeDO>>{
        return await AgentService.getInstance().queryComponentTypes(10000);

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

        return componentTypes;
    }
}