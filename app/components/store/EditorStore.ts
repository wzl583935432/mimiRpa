import ComponentTypeDO from '@/lib/Model/Editor/ComponentTypeDO';
import { create } from 'zustand';

export enum SelectType{
    Node,
    Line,
    Graph
}

export interface SelectedNode
{
    projectId: string;
    projectVersion: string;
    selectType: SelectType;
    nodeId: string;
    componentTypeId: string;
    alias:string,
    componentType:ComponentTypeDO|null;
}

export interface SelectedNodeState {
    selectedValue: SelectedNode; // 选中的组件
    setSelectedNode: (item: SelectedNode) => void; // 设置选中的组件
}


export const useSelectedNodeStore = create<SelectedNodeState>((set) => ({
    selectedValue: {
        projectId: '',
        projectVersion:'',
        selectType:SelectType.Node,
        nodeId: '',
        alias:'',
        componentTypeId: '',
        componentType: null,
    },
    setSelectedNode: (item: SelectedNode) => set(() => ({
        selectedValue: {
            projectId: item.projectId,
            projectVersion:item.projectVersion,
            selectType:item.selectType,
            nodeId: item.nodeId,
            alias:item.alias,
            componentType: item.componentType,
            componentTypeId: item.componentTypeId,
        }
    })),
}));
  