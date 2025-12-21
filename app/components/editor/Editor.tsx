import React, { useCallback, useRef, useState } from 'react';
import './Editor.css';
import MenuArea from './MenuArea';
import {NodeTreeArea } from './NodeTreeArea';
import PropertyArea from './PropertyArea';
import RuntimeArea from './RuntimeArea';
import WorkflowEditor from './WorkflowEditor';
import { ProjectService } from '@/app/biz/project_service';


interface EditorProps {
  editorId:string,
  projectId:string,
  projectVersion:string,
  onExecuteEvent:() => void;
}

const Editor: React.FC<EditorProps> = ({projectId, projectVersion}) => {

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isTopCollapsed, setIsTopCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  const handleClickExecute = () => {
    
  };

  return (
    <div className="layout-container">
      <div className={`top-panel ${isTopCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-content">
          <MenuArea onExportTriggered={() => {
              ProjectService.getInstance().exportProject( projectId, projectVersion);
          }}
          execute={handleClickExecute} 
          setCollapsed = {(isCollapsed)=>setIsTopCollapsed(isCollapsed)}/>
        </div>
      </div>

      <div className={`left-panel ${isLeftCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-content">
          <NodeTreeArea setCollapsed={(isCollapsed)=>setIsLeftCollapsed(isCollapsed)}/>
          </div>
      </div>

      <div className="center-panel">
        <div className="panel-content"><WorkflowEditor  projectId ={projectId} version={projectVersion} /></div>
      </div>

      <div className={`right-panel ${isRightCollapsed ? 'collapsed' : ''}`}>
         <div className="panel-content"><PropertyArea setCollapsed={ (isCollapsed) => setIsRightCollapsed(isCollapsed)}/></div>
      </div>

      <div className={`bottom-panel ${isBottomCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-content"><RuntimeArea setCollapsed={(isCollapsed) => setIsBottomCollapsed(isCollapsed)}/></div>
      </div>
    </div>
  );
};

export default Editor;