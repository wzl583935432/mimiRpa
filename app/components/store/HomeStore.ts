// store.js
import { create } from 'zustand';
import { ProjectInfoDO } from '@/lib/Model/Project/ProjectInfoDO';
import { v4 as uuidv4 } from 'uuid';
  interface  EditorItem { 
    id: string;
    data: ProjectInfoDO;
    version: string;
  } 

 interface ProjectEditorState {
    newItemId:string; // 最新加入的项目
    projectEditorItems: EditorItem[]; // 编辑器项目列表
    addEditorProject: (item: ProjectInfoDO, version: string) => void; // 添加项目到编辑器
    closeEditorProject: (id: string) => void; // 关闭编辑器中的项目
}


export const useProjectEditorStore = create<ProjectEditorState>((set) => ({
  // 状态 (State)
  newItemId: '', // 最新加入的项目
  projectEditorItems:[], // 购物车商品列表

  // Actions (修改状态的方法)

  // 增加商品到购物车
  addEditorProject: (item, version) => set((state) => {
    if (state.projectEditorItems.find(i => i.data.id === item.id && i.version === version)) {
      return state; // 如果项目已存在，直接返回当前状态
    }
    const editorItem = {
      id:uuidv4(),
      data:item,
      version:version
    } as EditorItem;
    
    const projectEditorItems = [...state.projectEditorItems, editorItem];
    return { 
      newItemId:editorItem.id,
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