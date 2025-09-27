import React, { useState, FC } from 'react'; // 引入 useState 和 FC (Functional Component)
import './Home.css'; // 样式文件
import Project from '@/app/components/project/Project'; // 项目组件
import Setting from '@/app/components/setting/Setting'; // 设置组件



// 定义 Main 组件的 props 类型
interface MainProps {
  // activePage 属性现在作为可选的初始值传入
  activePage?: string;
}

// 定义导航项的数据结构
interface NavItem {
  key: string;
  label: string;
}

// 导航项数据
const navItems: NavItem[] = [
  { key: 'project', label: '项目' },
  { key: 'setting', label: '设置' },
];

// Home 组件现在是一个函数式组件
const Home: FC<MainProps> = (props) => {
  // 使用 useState Hook 管理状态，默认值为 'project'
  const [activePage, setActivePage] = useState<string>(props.activePage || 'project');

  // 导航点击事件处理器
  // 使用 const 定义函数，替代类组件中的方法
  const handleNavClick = (page: string) => {
    // 使用 setActivePage 更新状态
    setActivePage(page);
  };

  // 根据当前状态渲染不同的内容组件
  const renderContent = () => {
    switch (activePage) {
      case 'project':
        return <Project />;
      case 'setting':
        return <Setting />;
      default:
        // 默认情况下返回 Project 组件，避免递归调用 Home 组件
        return <Project />;
    }
  };

  return (
    <div className="main-container">
      {/* 左侧导航栏 */}
      <div className="sidebar">
        <ul className="nav-list">
          {/* 动态生成导航列表 */}
          {navItems.map(item => (
            <li
              key={item.key} // React 列表渲染需要一个唯一的 key
              // 直接使用 activePage 状态
              className={`nav-item ${activePage === item.key ? 'active' : ''}`}
              // 直接调用 handleNavClick 函数
              onClick={() => handleNavClick(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 右侧内容区域 */}
      <div className="content-area">
        {/* 直接调用 renderContent 函数 */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Home;
