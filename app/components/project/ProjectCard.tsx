// src/components/ProjectCard.tsx
import React, { useState } from 'react';
import './ProjectList.css'; // 使用与父组件相同的样式文件
import { useProjectEditorStore } from '@/app/components/store/HomeStore';
import { ProjectInfoDO } from '@/lib/Model/Project/ProjectInfoDO';

// 定义项目数据的类型
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'stopped' | 'running';
  data: ProjectInfoDO;
}

// 定义组件的 props 类型
interface ProjectCardProps {
  project: Project;
  onToggleStatus: (id: string) => void;
  onSaveEdit: (id: string, newName: string, newDescription: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onToggleStatus, onSaveEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(project.name);
  const [editingDescription, setEditingDescription] = useState(project.description);
  const addEditorProject = useProjectEditorStore((state) => state.addEditorProject);
  // 点击进入编辑模式
  const handleEditClick = () => {
    addEditorProject(project.data);
    setIsEditing(true);
    setEditingName(project.name);
    setEditingDescription(project.description);
  };

  // 保存修改
  const handleSaveClick = () => {
    onSaveEdit(project.id, editingName, editingDescription);
    setIsEditing(false);
  };

  // 输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'editingName') {
      setEditingName(value);
    } else if (name === 'editingDescription') {
      setEditingDescription(value);
    }
  };

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
              onChange={handleInputChange}
            />
          </label>
          <label>
            项目信息:
            <textarea
              name="editingDescription"
              value={editingDescription}
              onChange={handleInputChange}
            />
          </label>
          <button className="save-btn" onClick={handleSaveClick}>
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
            <button className="edit-btn" onClick={handleEditClick}>
              编辑
            </button>
          </div>
        </>
      )}
    </div>
  );
};


