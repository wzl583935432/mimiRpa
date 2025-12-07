import { useEffect, useRef , useState, useCallback} from "react";
import {WorkflowEditorBiz} from "@/app/biz/workflow_editor_biz"
import CanvasArea from "./CanvasArea"

interface WorkflowEditorProb{
    projectId:string;
    version:string;
}

// 定义一个 Ref 类型，用于访问 C 组件暴露的方法
interface CCanvasRefHandle {
    // C 组件暴露出来的当前数据
    getCurrentData: () => string;
}


interface WorkflowGraphEditor{
    id:string;
    title:string;
    content: React.JSX.Element;
}

const WorkflowEditor: React.FC<WorkflowEditorProb> = ({projectId, version}) => {
    const workflowEditorBiz = new WorkflowEditorBiz(projectId, version)
    const [editors,setEditors] = useState<WorkflowGraphEditor[]>([]);
    const [activeTabId, setActiveTabId] = useState(editors[0].id);
    const canvasRefs = useRef<Map<string, CCanvasRefHandle>>(new Map());
  
    const handleClose =(id:string) =>{
      if('main'===id){
        return
      }
      const exsitEditors = editors.filter(editor => editor.id !== id)
      setEditors(exsitEditors);
    }


    

    const handleCResult = useCallback((status: string) => {
          
      }, []);

    useEffect(()=>{
        const load = async () => {
        const data = await workflowEditorBiz.getProjectMainGraph();

        const handleRef = (instance: CCanvasRefHandle | null) => {
          if (instance) {
            canvasRefs.current.set("main", instance);
          }
        };
        const  mainGraph: WorkflowGraphEditor = {
          id:"main",
          title:"首页",
          content:<CanvasArea data = {data}  ref={handleRef} // ⚠️ 使用 Ref 访问 C
                onDataSaved={handleCResult}></CanvasArea>
        }
        const newEditots = [mainGraph]
        setEditors(newEditots)
  };

  load();
    },[]);
  // 渲染 Tab 标题/导航区域
  const renderTabHeaders = () => (
    <div className="tab-headers">
      {editors.map((tab) => (

        <div
          key={tab.id}
          style={{
            color:"GrayText",
            padding: "8px 12px",
            borderBottom: activeTabId === tab.id ? "1px solid blue" : "1px solid transparent",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            marginRight: "1px",
            background: activeTabId === tab.id ? "#f0f5f5" : "white",
            borderRadius: "4px 4px 0 0",
          }}
          onClick={() => setActiveTabId(tab.id)}
        >
          <span>{tab.title}</span>

          {/* 第一个 tab 不显示关闭按钮 */}
          {tab.id !== 'home' && (
            <span
              onClick={(e) => {
                e.stopPropagation(); // 避免触发切换
                handleClose(tab.id);
              }}
              style={{
                marginLeft: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ×
            </span>
          )}
        </div>

      ))}
    </div>
  );

   // 渲染 Tab 内容区域
  const renderTabContent = () => {
    // 找到当前激活的 Tab 对象
    const activeTabItem = editors.find(tab => tab.id === activeTabId);

    // 只渲染匹配的内容
    return (
      <div className="tab-content">
        {activeTabItem ? activeTabItem.content : <p>内容加载失败。</p>}
      </div>
    );
  };

  return (
    <div className="menuArea-container">
      {/* 标签头位于上方 */}
      {renderTabHeaders()}
      
      {/* 标签对应的内容区域 */}
      {renderTabContent()}
    </div>
  );
};

export default WorkflowEditor;