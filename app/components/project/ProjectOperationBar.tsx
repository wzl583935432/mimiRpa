

// components/OperationBar.js
import React, { useState } from 'react';
import './ProjectOperationBar.css';

const tabs = [
  { key: 'all', name: '全部' },
  { key: 'published', name: '已发布' },
  { key: 'develop', name: '开发中' },
];

const ProjectOperationBar = ({ onTabChange, onSearch, onAddNew }) => {
  const [activeTab, setActiveTab] = useState('all'); // 默认选中 '数据列表'
  const [searchText, setSearchText] = useState('');

  const handleTabClick = (key) => {
    setActiveTab(key);
    onTabChange(key); // 如果需要通知父组件内容区切换
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        onSearch(searchText);
    }
};

 const handleNewProject = () => {
    onAddNew();
  }

  return (
    <div className="operation-bar">
      {/* 左侧侧内容的 Tab 页 */}
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            // 简单样式：选中状态加粗
            style={{ 
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                marginRight: '10px',
                padding: '5px 10px',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: 'transparent',
            }}
          >
            {tab.name}
          </button>
        ))}
            {/* 最右侧侧按钮 */}
        </div>
        <div className="right-operations">
      {/* 搜索框：添加 onKeyDown 事件监听 */}
      <input
        type="text"
        placeholder="搜索 (回车触发)"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown} // ⭐ 关键：监听回车事件
        style={{ width:'120', padding: '5px', color:'#0b0a0aff', border: '1px solid #484848ff', borderRadius: '4px' }}
      />
      
      <button 
        onClick={() => onSearch(searchText)} // 点击按钮触发搜索
        style={{ padding: '6px 12px', color:'#0b0a0aff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
      >
        🔍 搜索
      </button>

      {/* 新增按钮 */}
      <button 
        onClick={ handleNewProject}
        style={{ 
            padding: '6px 12px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
        }}
      >
        ➕ 新增
      </button>
    </div>
    </div>
  );
};

export default ProjectOperationBar;