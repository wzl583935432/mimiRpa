import './Project.css';
import ProjectList from './ProjectCardList';
//export const ThemeContext = React.createContext('light');
import ProjectOperationBar from './ProjectOperationBar';
import React ,{useState} from 'react';
import './Project.css';
import NewProject from './NewProject';



const Project = () => {
  const [tabOption, setTabOption] = useState('all');
  const [search, setSearch] = useState('');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectId, setNewProjectId] = useState<string | undefined>(undefined);  
  const optionOnChange = (option:string) => {
    setTabOption(option);
  };

  const handlesearchChange = (value:string) => {
    setSearch(value);
  }

  // 弹窗关闭函数
  const handleModalClose = (projectId) => {
    setIsNewProjectModalOpen(false);
    if(projectId){
      setNewProjectId(projectId);
    }
  };
  

  const onAddNew = () => {
      setIsNewProjectModalOpen(true);
  } 

  return (
    <div className="project-list">
      <h1>项目管理</h1>
      <ProjectOperationBar onTabChange = {optionOnChange}  onSearch={handlesearchChange} onAddNew={onAddNew} />
      <ProjectList tabOption = {tabOption} search={search} newProjectId= {newProjectId} />
      <NewProject isOpen={isNewProjectModalOpen}  onClose={handleModalClose}></ NewProject>
    </div>
  );
};

export default Project;