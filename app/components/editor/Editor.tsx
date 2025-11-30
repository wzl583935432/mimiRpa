import React, { useCallback, useRef, useState } from 'react';
import './Editor.css';
import MenuArea from './MenuArea';
import {NodeTreeArea } from './NodeTreeArea';
import CanvasArea from './CanvasArea';
import PropertyArea from './PropertyArea';
import RuntimeArea from './RuntimeArea';


interface EditorProps {
  editorId:string,
  projectId:string,
  projectVersion:string,
  onExecuteEvent:() => void;
}

// 定义一个 Ref 类型，用于访问 C 组件暴露的方法
interface CCanvasRefHandle {
    // C 组件暴露出来的保存方法
    executeSave: () => void;
    // C 组件暴露出来的当前数据
    getCurrentData: () => string;
}


const Editor: React.FC<EditorProps> = () => {
// 1. 用于存储 C 组件实例的 Ref
    const cRef = useRef<CCanvasRefHandle>(null); 

  // 2. 核心：定义 B 组件触发的回调函数
  // 使用 useCallback 确保函数引用稳定，避免不必要的子组件重渲染
    const handleBClickSave = useCallback(() => {
        if (cRef.current) {
            console.log("[A 协调] 收到 B 请求，正在调用 C 的保存方法...");
            
            // 4. A 调用 C 暴露出来的执行函数
            cRef.current.executeSave(); 
            
            // 演示：A 也可以直接获取 C 的数据
            const data = cRef.current.getCurrentData();

            console.log(data)
        } 
    }, []); 

    const handleClickExecute = useCallback(()=>{

    if (cRef.current) {
            console.log("[A 协调] 收到 B 请求，正在调用 C 的保存方法...");
            
            // 4. A 调用 C 暴露出来的执行函数
            cRef.current.executeSave(); 
            
            // 演示：A 也可以直接获取 C 的数据
            const data = cRef.current.getCurrentData();

            console.log(data)
        } 
    },[])

  const handleCResult = useCallback((status: string) => {
        
    }, []);

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isTopCollapsed, setIsTopCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  return (
    <div className="layout-container">
      <div className={`top-panel ${isTopCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-content">
          <MenuArea onSaveTriggered={handleBClickSave} 
          execute={handleClickExecute} 
          setCollapsed = {(isCollapsed)=>setIsTopCollapsed(isCollapsed)}/>
        </div>
      </div>

      <div className={`left-panel ${isLeftCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-content">
          <NodeTreeArea setCollapsed={(isCollapsed)=>setIsLeftCollapsed(isCollapsed)}/>
          </div>
      </div>

      <div className="center-panel">
        <div className="panel-content"><CanvasArea  ref={cRef} // ⚠️ 使用 Ref 访问 C
                onDataSaved={handleCResult}  /></div>
      </div>

      <div className={`right-panel ${isRightCollapsed ? 'collapsed' : ''}`}>
         <div className="panel-content"><PropertyArea setCollapsed={ (isCollapsed) => setIsRightCollapsed(isCollapsed)}/></div>
      </div>

      <div className={`bottom-panel ${isBottomCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-content"><RuntimeArea setCollapsed={(isCollapsed) => setIsBottomCollapsed(isCollapsed)}/></div>
      </div>
    </div>
  );
};

export default Editor;