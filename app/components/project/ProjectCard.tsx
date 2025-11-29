// src/components/ProjectCard.tsx
import React, { useEffect, useState } from 'react';
import './ProjectList.css'; // 使用与父组件相同的样式文件
import { ProjectVersionStatus } from '@/lib/Model/Project/ProjectInfoDO';

import { ProjectInfoDO } from '@/lib/Model/Project/ProjectInfoDO';

// 定义组件的 props 类型
interface ProjectCardProps {
  project: ProjectInfoDO;
  onToggleExecute: (id: string, version: string) => void;
  onToggleEdit: (id: string, version: string) => void;
  onNewVersion: (id: string, originVersion:string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onToggleExecute, onToggleEdit, onNewVersion }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [editingName, setEditingName] = useState(project.name);
  const [editingDescription, setEditingDescription] = useState(project.description);
  
  // 点击进入编辑模式
  const handleEditClick = () => {
    setEditingName(project.name);
    setEditingDescription(project.description);
  };

  useEffect(() => {
    setEditingName(project.name);
    setEditingDescription(project.description);
  }
  , [project.name, project.description]);

  useEffect(() => {
    if(project.versions){
      for (const workflow of project.versions) {
        if (workflow.status === ProjectVersionStatus.Published) {
          setIsRunning(true);
          break;
        }
      }
    }

  }, [project.versions]); 

  
    // 简单的版本号比较函数
    const compareVersions = (versionA: string, versionB: string) => {
        const versionArrayA = versionA.split('.').map(Number);
        const versionArrayB = versionB.split('.').map(Number);

        const length = Math.max(versionArrayA.length, versionArrayB.length);

        for (let i = 0; i < length; i++) {
            const segmentA = versionArrayA[i] || 0;
            const segmentB = versionArrayB[i] || 0;

            if (segmentA > segmentB) return 1;
            if (segmentA < segmentB) return -1;
        }

        return 0;
    }


  const handleExecuteClick = () => {
    let version: string | null = null;
    for (const workflow of project.versions || []) {
      if (workflow.status === ProjectVersionStatus.Published) {
        if (version === null || compareVersions(workflow.version, version) > 0) {
          version = workflow.version;
        }
      }
    }
    if(version===null){
      alert("项目未发布，无法运行");
      return;
    }
    onToggleExecute(project.id, version);
  };
  // 保存修改
  const handleSaveClick = () => {
   
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


  return (
    <div className="project-card">
     
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
              value={editingDescription??''}
              onChange={handleInputChange}
            />
          </label>
                    <button
              className={`run-btn ${isRunning ? 'running' : ''}`}
              onClick={handleExecuteClick}
            >
              {isRunning ? '停止' : '运行'}
            </button>
          <button className="edit-btn" onClick={handleEditClick}>
              编辑
          </button>
        </div>
    </div>
  );
};


