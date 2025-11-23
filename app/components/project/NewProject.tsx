
import { useState} from 'react';
import './NewProject.css';
import {ProjectService} from '@/app/biz/project_service'
import { ProjectStatus } from '@/lib/Model/Project/ProjectInfoDO';

const NewProject = ({ isOpen, onClose }) => {
    // Hooks must run unconditionally at the top of the component
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) {
        return null; // 如果 isOpen 为 false，不渲染任何内容
    }

    const handleBClickSave = async () => {
        try{
            const projectInfo = await ProjectService.getInstance().CreateNewProject({
                name: name,
                description: description,
                id: '',
                status: ProjectStatus.Enabled,
                createTime: 0,
                lastEditTime: 0,
                createUser: '',
                versions: null
            });
            // 这里可以添加保存逻辑
            onClose(projectInfo.id);
        }catch(err){
            console.error('保存新项目时出错:', err);
        }   

    }

    return (    
        // 遮罩层 (点击遮罩可以关闭)
    <div className="new-project-backdrop" onClick={onClose}>
      
      {/* 对话框主体 (阻止点击主体时关闭对话框) */}
      <div 
        className="new-project-content" 
        onClick={e => e.stopPropagation()} 
      >
        <h2>新建项目</h2>

        {/* 示例表单 */}
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="名称"
          style={{ margin: '10px 0', padding: '8px' }}
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="描述"
          style={{ margin: '10px 0', padding: '8px', width: '100%' }}
        />

        <div className="new-project-actions">
          <button onClick={ ()=>{ onClose(null)}} style={{ marginRight: '10px', height:36 }}>取消</button>
          <button onClick={handleBClickSave} style={{ backgroundColor: '#3f51b5', color: 'white' , height:36 }}>
            提交
          </button>
        </div>
      </div>
    </div>
    );
}
export default NewProject;