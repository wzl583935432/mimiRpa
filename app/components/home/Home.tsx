// src/components/Home/Home.tsx
import React, { Component } from 'react';
import './Home.css'; // 可选：如果需要单独的样式

// 定义 Home 组件的 props 和 state 类型，这里为空
interface HomeProps {
    string?: string;
}
interface HomeState {
    string?: string;
}

class Home extends Component<HomeProps, HomeState> {
  render() {
    return (
      <div className="home-page">
        <h1>主页</h1>
        <p>欢迎来到主页！这里是你的概览信息。</p>
      </div>
    );
  }
}

export default Home;