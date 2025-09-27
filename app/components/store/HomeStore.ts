// store.js
import { create } from 'zustand';
import { ProjectInfoDO } from '@/lib/Model/Project/ProjectInfoDO';
 interface ProjectEditorState {
    projectEditorItems: ProjectInfoDO[]; // 编辑器项目列表
    addEditorProject: (item: ProjectInfoDO) => void; // 添加项目到编辑器
    closeEditorProject: (id: string) => void; // 关闭编辑器中的项目
}


export const useProjectEditorStore = create<ProjectEditorState>((set) => ({
  // 状态 (State)
  projectEditorItems:[], // 购物车商品列表

  // Actions (修改状态的方法)

  // 增加商品到购物车
  addEditorProject: (item) => set((state) => {
    const projectEditorItems = [...state.projectEditorItems, item];
    return { 
      projectEditorItems: projectEditorItems,
    };
  }),
  closeEditorProject: (id) => set((state) => {
    const projectEditorItems = state.projectEditorItems.filter(i => i.id !== id);
    return { 
      projectEditorItems: projectEditorItems,
    };
  }),
      
}));