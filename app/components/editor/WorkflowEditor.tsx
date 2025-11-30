import { ProjectService } from "@/app/biz/project_service";
import { InteractionFilled } from "@ant-design/icons";
import { useEffect, useState } from "react";

interface WorkflowEditorProb{
    projectId:string;
    version:string;
}

interface WorkflowGraphEditor{
    id:string;
    title:string;

}

const WorkflowEditor: React.FC<WorkflowEditorProb> = ({projectId, version}) => {
    const [editors,setEditors] = useState<WorkflowGraphEditor[]>([]);
    const [activeTabId, setActiveTabId] = useState(editors[0].id);

    const handleClose =(id:string) =>{

    }

    useEffect(()=>{
        const load = async () => {
    const data = await ProjectService.getInstance().getProjectMainGraph(projectId, version);
    console.log(data);
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