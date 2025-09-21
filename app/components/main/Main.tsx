// src/components/Main.tsx
import React, { Component } from 'react';
import './Main.css';
import Home from '@/app/components/home/Home';
import Project from '@/app/components/project/Project';
import Setting from '@/app/components/setting/Setting';
import { JSX } from 'react/jsx-runtime';

// 定义 Main 组件的 props 类型
interface MainProps {
  activePage?: string;
}

// 定义 Main 组件的 state 类型
interface MainState {
  activePage: string;
}

// 定义导航项的数据结构
interface NavItem {
  key: string;
  label: string;
}

// 导航项数据
const navItems: NavItem[] = [
  { key: 'home', label: '首页' },
  { key: 'project', label: '项目' },
  { key: 'setting', label: '设置' },
];

class Main extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    // 初始化状态，activePage 存储当前选中的页面名称
    this.state = {
      activePage: 'home',
    };
  }

  // 导航点击事件处理器
  handleNavClick = (page: string) => {
    this.setState({ activePage: page });
  };

  // 根据当前状态渲染不同的内容组件
  renderContent(): JSX.Element {
    const { activePage } = this.state;
    switch (activePage) {
      case 'home':
        return <Home />;
      case 'project':
        return <Project />;
      case 'setting':
        return <Setting />;
      default:
        return <Home />;
    }
  }

  render() {
    const { activePage } = this.state;

    return (
      <div className="main-container">
        {/* 左侧导航栏 */}
        <div className="sidebar">
          <ul className="nav-list">
            {/* 动态生成导航列表 */}
            {navItems.map(item => (
              <li
                key={item.key} // React 列表渲染需要一个唯一的 key
                className={`nav-item ${activePage === item.key ? 'active' : ''}`}
                onClick={() => this.handleNavClick(item.key)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
        
        {/* 右侧内容区域 */}
        <div className="content-area">
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

export default Main;