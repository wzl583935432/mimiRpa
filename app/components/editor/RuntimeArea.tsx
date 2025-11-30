import React, { useState } from 'react';
import './Editor.css';

interface RunTimeProb{
    setCollapsed: (iscollapsed:boolean)=> void; 
}

const RuntimeArea: React.FC<RunTimeProb> = ( {setCollapsed}) => {
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  const handleOnCollapsed = () =>{
    setCollapsed(!isBottomCollapsed)
    setIsBottomCollapsed(!isBottomCollapsed)
    console.log("isBottomCollapsed", isBottomCollapsed)
  }
  return (
    <div className="menuArea-container">
          <button 
            className="toggle-btn bottom-toggle"
            onClick={handleOnCollapsed}
          >
            {isBottomCollapsed ? '↑' : '↓'}
          </button>
    </div>
  );
};

export default RuntimeArea;