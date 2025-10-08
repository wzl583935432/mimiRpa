import ComponentTypeDO from '@/lib/Model/Editor/ComponentTypeDO';
import { create } from 'zustand';

export interface SelectedComponent
{
    projectId: string;
    componentId: string;
    componentTypeId: string;
    componentType:ComponentTypeDO|null;
    properties:  Record<string, any>;
}

export interface SelectedComponentState {
    selectedComponent: SelectedComponent; // 选中的组件
    setSelectedComponent: (item: SelectedComponent) => void; // 设置选中的组件
    editComponentProperty: (key: string, value: any) => void; // 编辑组件属性
}


export const useSelectedComponentStore = create<SelectedComponentState>((set) => ({
    selectedComponent: {
        projectId: '',
        componentId: '',
        componentTypeId: '',
        properties: {},
        componentType: null,
    },
    setSelectedComponent: (item: SelectedComponent) => set(() => ({
        selectedComponent: {
            projectId: item.projectId,
            componentId: item.componentId,
            componentType: item.componentType,
            componentTypeId: item.componentTypeId,
            properties: item.properties,
        }
    })),
    editComponentProperty: (key: string, value: any) => set((state) => ({
        selectedComponent: {
            ...state.selectedComponent,
            properties: {
                ...state.selectedComponent.properties,
                [key]: value,
            },
        }
    })),
}));
  