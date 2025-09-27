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
    const [tabData, setTabData] = useState(initialTabData);
    const  projectEditorItems  = useProjectEditorStore(((state) => state.projectEditorItems));

  // 1. 使用 useState 追踪当前激活的 Tab ID，默认为第一个标签的 ID
  const [activeTabId, setActiveTabId] = useState(tabData[0].id);
 useEffect(() => {
    const fetchProjects = async () => {
        const tabs = [...initialTabData];
      projectEditorItems.forEach(item => {
            const itemTab: Tab = {
                id: item.id,
                title: item.name,
                content: <Editor/>
            };
            tabs.push(itemTab);
        });
        setTabData(tabs);
        if (projectEditorItems.length > 0) {
        //    setActiveTabId(projectEditorItems[projectEditorItems.length - 1].id);
        } else {
        //    setActiveTabId('home');
        }
    };
    fetchProjects();
    }, [projectEditorItems]);
  
  
  // 渲染 Tab 标题/导航区域
  const renderTabHeaders = () => (
    <div className="tab-headers">
      {tabData.map((tab) => (
        <button
          key={tab.id}
          // 根据 activeTabId 动态添加 'active' 类名
          className={`tab-button ${activeTabId === tab.id ? 'active' : ''}`}
          // 点击时更新状态，切换标签
          onClick={() => setActiveTabId(tab.id)}
        >
          {tab.title}
        </button>
      ))}
    </div>
  );

  // 渲染 Tab 内容区域
  const renderTabContent = () => {
    // 找到当前激活的 Tab 对象
    const activeTabItem = tabData.find(tab => tab.id === activeTabId);

    // 只渲染匹配的内容
    return (
      <div className="tab-content">
        {activeTabItem ? activeTabItem.content : <p>内容加载失败。</p>}
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