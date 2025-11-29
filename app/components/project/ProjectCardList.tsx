// src/components/ProjectList.tsx

import React, {useEffect, useState } from 'react';
import {ProjectCard} from './ProjectCard';
import './ProjectList.css';
import {ProjectService} from '@/app/biz/project_service';
import { ProjectInfoDO, ProjectVersionStatus } from '@/lib/Model/Project/ProjectInfoDO';
import { useProjectEditorStore } from '@/app/components/store/HomeStore';

// 定义项目数据的类型
interface ProjectOperationProps {
  tabOption:string,
  search:string
  newProjectId?:string;
}
  // 这里可以添加需要的 props
  

const ProjectList: React.FC <ProjectOperationProps>= ( {tabOption, search, newProjectId} ) => {
  // 使用 useState 钩子管理组件内部状态
  const [allProjects, setAllProjects] = useState<ProjectInfoDO[]>(
    []);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentProjects, setCurrentProjects] = useState<ProjectInfoDO[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([]);
  const addEditorProject = useProjectEditorStore((state) => state.addEditorProject);
  const projectsPerPage = 6; // 每页显示的项目数量

 useEffect(() => {
    const fetchProjects = async () => {
      let projects = await ProjectService.getInstance().GetProjectList();
      projects = projects.filter(project => {
        if (search && search.trim() !== '') {
          const lowerCaseSearch = search.toLowerCase();
          if (!project.name.toLowerCase().includes(lowerCaseSearch) &&
              !(project.description && project.description.toLowerCase().includes(lowerCaseSearch))) {
            return false;
          }
        }
       // console.log('Filtering project:', project.name, 'with tabOption:', tabOption);
        // 根据 tabOption 过滤项目
        if (tabOption === 'published') {
          if (!project.versions || project.versions.length === 0) {
            return false;
          }
          for (const workflow of project.versions) {
            if (workflow.status === ProjectVersionStatus.Published) {
              return true;
            } 
          }
          return false;
        } else if (tabOption === 'develop') {
          if (!project.versions || project.versions.length === 0) {
            return true;
          }
          for (const workflow of project.versions) {
            if (workflow.status === ProjectVersionStatus.Editor) {
              return true;
            } 
          }
          return false;
        }
        return true; // 'all' 选项显示所有项目
      });


      setAllProjects(projects)
    };
    fetchProjects();
  }, [tabOption, search, newProjectId]);


  // 切换项目运行状态的回调函数
  const handleToggleExecute = (id: string) => {

  };

  // 保存项目编辑的回调函数
  const handleEditClick = (id: string, version: string) => {
    const project = allProjects.find(proj => proj.id === id);
    if (!project) {
      alert('未找到对应的项目');
      return;
    }
    addEditorProject(project, version);
  };

  const handleNewVersion = (id: string, originVersion:string) => {
    const project = allProjects.find(proj => proj.id === id);
    if (!project) {
      alert('未找到对应的项目');
      return;
    }
    ProjectService.getInstance().createNewProjectVersion(id, originVersion).then((newProjectVersion) => {
      console.log('新版本创建成功:', newProjectVersion);
    });
  }

  // 改变页码
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1); // 切换 tab 或搜索时重置为第一页
     // 计算当前页需要显示的项目（使用第一页）
    const page = 1;
    const indexOfLastProject = page * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = allProjects.slice(indexOfFirstProject, indexOfLastProject);
    setCurrentProjects(currentProjects);
    // 计算总页数
    const totalPages = Math.ceil(allProjects.length / projectsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    setPageNumbers(pageNumbers);

  }, [allProjects]);

  useEffect(() => {
    // 计算当前页需要显示的项目
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = allProjects.slice(indexOfFirstProject, indexOfLastProject);
    setCurrentProjects(currentProjects);
  }, [currentPage, allProjects]);

  return (
    <div className="project-list-container">
      <div className="project-cards-wrapper">
        {currentProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onToggleExecute={handleToggleExecute}
            onToggleEdit={handleEditClick}
            onNewVersion={handleNewVersion}
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