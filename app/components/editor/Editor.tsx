import React, { useState } from 'react';
import './Editor.css';
import MenuArea from './MenuArea';
import NodeArea from './NodeArea';
import CanvasArea from './CanvasArea';
import PropertyArea from './PropertyArea';
import RuntimeArea from './RuntimeArea';

interface LayoutProps {
  leftContent?: React.ReactNode;
  topContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const Editor: React.FC<LayoutProps> = () => {


  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isTopCollapsed, setIsTopCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  return (
    <div className="layout-container">
      <div className={`top-panel ${isTopCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-content">
          <MenuArea/>
        </div>
        <button 
          className="toggle-btn top-toggle"
          onClick={() => setIsTopCollapsed(!isTopCollapsed)}
        >
          {isTopCollapsed ? '↓' : '↑'}
        </button>
      </div>

      <div className={`left-panel ${isLeftCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="toggle-btn left-toggle"
          onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
        >
          {isLeftCollapsed ? '→' : '←'}
        </button>
        {!isLeftCollapsed && <div className="panel-content"><NodeArea/></div>}
      </div>

      <div className="center-panel">
        <div className="panel-content"><CanvasArea/></div>
      </div>

      <div className={`right-panel ${isRightCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="toggle-btn right-toggle"
          onClick={() => setIsRightCollapsed(!isRightCollapsed)}
        >
          {isRightCollapsed ? '←' : '→'}
        </button>
        {!isRightCollapsed && <div className="panel-content"><PropertyArea/></div>}
      </div>

      <div className={`bottom-panel ${isBottomCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="toggle-btn bottom-toggle"
          onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
        >
          {isBottomCollapsed ? '↑' : '↓'}
        </button>
        <div className="panel-content"><RuntimeArea/></div>
      </div>
    </div>
  );
};

export default Editor;