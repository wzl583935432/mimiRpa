import React, {useEffect, useState } from 'react';
import './MainTab.css'; // 导入样式文件
import  Home from '@/app/components/home/Home';
// 假设这些依赖的路径是正确的
import { useProjectEditorStore } from '@/app/components/store/HomeStore';
import Editor from '@/app/components/editor/Editor';


interface Tab {
  id: string;
  title: string;
  content: React.JSX.Element;
}


// 标签数据结构：包含 ID、标题和内容（可以是任何 React 元素）
const initialTabData: Tab[] = [
  { id: 'home', title: '首页', content: <Home/> },
];

const MainTab = () => {
  const newEditId  = useProjectEditorStore(((state) =>state.newItemId))
  const [tabData, setTabData] = useState(initialTabData);
  const  projectEditorItems  = useProjectEditorStore(((state) => state.projectEditorItems));
  const closeEditorProject =  useProjectEditorStore(((state) => state.closeEditorProject));

  // 1. 使用 useState 追踪当前激活的 Tab ID，默认为第一个标签的 ID
  const [activeTabId, setActiveTabId] = useState(tabData[0].id);

  const handleClose = (id:string) =>{
    let befid = "home";
    for(const item of projectEditorItems){
      if(id === item.id){
        break;
      }
      befid = item.id;
    }
    closeEditorProject(id)
    setActiveTabId(befid)
  }
  const handleEditorExecute = () =>{

  }
 useEffect(() => {
    const fetchProjects = async () => {
      const tabs = [...initialTabData];
      projectEditorItems.forEach(item => {
            const itemTab: Tab = {
                id: item.id,
                title: item.data.name,
                content: <Editor editorId= {item.id} 
                projectId= {item.data.id} 
                projectVersion= {item.version} 
                onExecuteEvent={handleEditorExecute}/>
            };
            tabs.push(itemTab);
        });
        setTabData(tabs);
        if (projectEditorItems.length > 0) {
        //    setActiveTabId(projectEditorItems[projectEditorItems.length - 1].id);
        } else {
        //    setActiveTabId('home');
        }
        if(newEditId){
          setActiveTabId(newEditId)
        }
    };
    fetchProjects();
    }, [projectEditorItems, newEditId]);


  
  // 渲染 Tab 标题/导航区域
  const renderTabHeaders = () => (
    <div className="tab-headers">
      {tabData.map((tab) => (

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
  return (
   <div className="tab-content">
       {tabData.map(tab => (
         <div
            key={tab.id}
            // 使用 style.display 控制显示和隐藏
            style={{ display: tab.id === activeTabId ? 'block' : 'none' }}
            // 或者使用 className/CSS 
            // className={`tab-pane ${tab.id === activeTabId ? 'active' : ''}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="tabs-container">
      {/* 标签头位于上方 */}
      {renderTabHeaders()}
      
      {/* 标签对应的内容区域 */}
      {renderTabContent()}
    </div>
  );
};

export default MainTab;