// src/components/ProjectList.tsx

import React, {useEffect, useState } from 'react';
import {ProjectCard, Project} from './ProjectCard';
import './ProjectList.css';
import {ProjectService} from '@/app/biz/project_service';

// 定义项目数据的类型


const ProjectList: React.FC= () => {
  // 使用 useState 钩子管理组件内部状态
  const [allProjects, setAllProjects] = useState<Project[]>(
    []);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6; // 每页显示的项目数量

 useEffect(() => {
    const fetchProjects = async () => {
      const projects = await ProjectService.getInstance().GetProjectList();

      setAllProjects(projects.map((p, index) => ({
        id: p.id,
        name: p.name,
        description: p.description || '暂无描述',
        status: index % 2 === 0 ? 'running' : 'stopped', // 示例状态
        data: p,
      })))
    };
    fetchProjects();
  }, []);


  // 切换项目运行状态的回调函数
  const handleToggleStatus = (id: string) => {
    setAllProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === id ? { ...project, status: project.status === 'running' ? 'stopped' : 'running' } : project
      )
    );
  };

  // 保存项目编辑的回调函数
  const handleSaveEdit = (id: string, newName: string, newDescription: string) => {
    setAllProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === id ? { ...project, name: newName, description: newDescription } : project
      )
    );
  };

  // 改变页码
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // 计算当前页需要显示的项目
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = allProjects.slice(indexOfFirstProject, indexOfLastProject);

  // 计算总页数
  const totalPages = Math.ceil(allProjects.length / projectsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="project-list-container">
      <div className="project-cards-wrapper">
        {currentProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onToggleStatus={handleToggleStatus}
            onSaveEdit={handleSaveEdit}
          />
        ))}
      </div>
      <div className="pagination">
        {pageNumbers.map(number => (
          <button
            key={number}
            className={`page-btn ${number === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;