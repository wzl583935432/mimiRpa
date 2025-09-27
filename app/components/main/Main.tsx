// src/components/Main.tsx
import React from 'react';
import MainTab from "./MainTab";
import './Main.css';

// Main 组件现在是一个函数组件
const Main: React.FC = () => {
 
  // 在函数组件中，render 逻辑直接作为函数的返回值。
  // activePage 的类型是通过 useState 泛型参数 <string> 确定的，
  // 所以我们不再需要 MainState 接口。
  return (
    // 假设 MainTab 需要 activePage 状态，您可以将其作为 prop 传递
      <div className="main-container">
          <MainTab  />
      </div>
  );
};

export default Main;