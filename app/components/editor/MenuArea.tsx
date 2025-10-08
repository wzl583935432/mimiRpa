import React, { useState } from 'react';
import './MenuArea.css';
import { Button, Space } from 'antd';

// 定义 B 组件需要的 Props
export interface MenuProps {
  // B 组件点击时调用的回调函数。
  // 它接收一个参数：B 组件想要保存的数据（类型为 string）。
  onSaveTriggered: () => void;
  execute:()=> void;
}

const MenuArea: React.FC<MenuProps> = ({ onSaveTriggered,execute }) => {
    const handleSaveClick = () => {
    onSaveTriggered(); 
  };

  const handleExecuteClick =() =>{
    execute();
  }

  return (
    <div className="menuArea-container">
     <Space>
        <Button onClick={handleSaveClick} type="primary">保存</Button> 
        <Button onClick={handleExecuteClick} type='primary'> 运行</Button>
     </Space>

    </div>
  );
};

export default MenuArea;