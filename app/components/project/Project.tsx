import './Project.css';
import ProjectList from './ProjectCardList';
//export const ThemeContext = React.createContext('light');
import {ProjectService} from '@/app/biz/project_service';
import React, { useContext, useEffect, useState } from 'react';
import './Project.css';


const Project = () => {
  const [projectList, setProjectList] = useState<any[]>([]);
 // const ccc = useContext(ThemeContext);
  //console.warn(ccc);

  useEffect(() => {
    const fetchProjects = async () => {
      const projects = await ProjectService.getInstance().GetProjectList();
      setProjectList(projects);
    };
    fetchProjects();
  }, []);

  return (
    <div className="project-list">
      <h1>项目管理</h1>
      <ProjectList userId='xxx' />
    </div>
  );
};

export default Project;