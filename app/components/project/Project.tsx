import './Project.css';
import ProjectList from './ProjectCardList';
//export const ThemeContext = React.createContext('light');
import React from 'react';
import './Project.css';


const Project = () => {

  return (
    <div className="project-list">
      <h1>项目管理</h1>
      <ProjectList />
    </div>
  );
};

export default Project;