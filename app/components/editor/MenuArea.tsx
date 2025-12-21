import React, { useState } from 'react';
import './MenuArea.css';
import { Button, Space } from 'antd';

// 定义 B 组件需要的 Props
export interface MenuProps {
  // B 组件点击时调用的回调函数。
  // 它接收一个参数：B 组件想要保存的数据（类型为 string）。
  onExportTriggered: () => void;
  execute:()=> void;
  setCollapsed: (iscollapsed:boolean)=> void;
}

const MenuArea: React.FC<MenuProps> = ({onExportTriggered, execute, setCollapsed }) => {
  const [isTopCollapsed, setIsTopCollapsed] = useState(false);
    const handleExportClick = () => {
    onExportTriggered(); 
  };

  const handleOnCollapsed = () =>{
    setCollapsed(!isTopCollapsed)
    setIsTopCollapsed(!isTopCollapsed)
  }

  const handleExecuteClick =() =>{
    execute();
  }

  return (
    <div className="menuArea-container">
     <Space>
        <Button onClick={handleExportClick} type="primary">导出</Button> 
        <Button onClick={handleExecuteClick} type='primary'> 运行</Button>
        <button 
          className="toggle-btn top-toggle"
          onClick={handleOnCollapsed}
        >
          {isTopCollapsed ? '↓' : '↑'}
        </button>
     </Space>

    </div>
  );
};

export default MenuArea;