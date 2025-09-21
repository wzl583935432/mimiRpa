// src/components/ProjectCard.tsx

import React, { Component } from 'react';
import './ProjectList.css'; // 使用与父组件相同的样式文件

// 定义项目数据的类型
interface Project {
  id: number;
  name: string;
  description: string;
  status: 'stopped' | 'running';
}

// 定义组件的 props 类型
interface ProjectCardProps {
  project: Project;
  onToggleStatus: (id: number) => void;
  onSaveEdit: (id: number, newName: string, newDescription: string) => void;
}

// 定义组件的 state 类型
interface ProjectCardState {
  isEditing: boolean;
  editingName: string;
  editingDescription: string;
}

class ProjectCard extends Component<ProjectCardProps, ProjectCardState> {
  constructor(props: ProjectCardProps) {
    super(props);
    this.state = {
      isEditing: false,
      editingName: props.project.name,
      editingDescription: props.project.description,
    };
  }

  // 组件接收新 props 时更新内部 state
  static getDerivedStateFromProps(nextProps: ProjectCardProps, prevState: ProjectCardState) {
    // 检查项目ID是否改变，如果改变则重置编辑状态
    if (nextProps.project.id !== prevState.editingName.length) { // 这里用一个简单的逻辑来判断是否是同一个项目
      return {
        isEditing: false,
        editingName: nextProps.project.name,
        editingDescription: nextProps.project.description,
      };
    }
    return null;
  }

  // 处理“编辑”按钮点击，进入编辑模式
  handleEditClick = () => {
    this.setState({
      isEditing: true,
      editingName: this.props.project.name,
      editingDescription: this.props.project.description,
    });
  };

  // 处理“保存”按钮点击，调用父组件的回调函数
  handleSaveClick = () => {
    const { onSaveEdit, project } = this.props;
    const { editingName, editingDescription } = this.state;
    onSaveEdit(project.id, editingName, editingDescription);
    this.setState({ isEditing: false });
  };

  // 处理表单输入变化
  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    } as Pick<ProjectCardState, 'editingName' | 'editingDescription'>);
  };

  render() {
    const { project, onToggleStatus } = this.props;
    const { isEditing, editingName, editingDescription } = this.state;
    const isRunning = project.status === 'running';

    return (
      <div className="project-card">
        {isEditing ? (
          <div className="card-editor">
            <label>
              项目名:
              <input
                type="text"
                name="editingName"
                value={editingName}
                onChange={this.handleInputChange}
              />
            </label>
            <label>
              项目信息:
              <textarea
                name="editingDescription"
                value={editingDescription}
                onChange={this.handleInputChange}
              />
            </label>
            <button className="save-btn" onClick={this.handleSaveClick}>
              保存
            </button>
          </div>
        ) : (
          <>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="card-actions">
              <button
                className={`run-btn ${isRunning ? 'running' : ''}`}
                onClick={() => onToggleStatus(project.id)}
              >
                {isRunning ? '停止' : '运行'}
              </button>
              <button className="edit-btn" onClick={this.handleEditClick}>
                编辑
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default ProjectCard;