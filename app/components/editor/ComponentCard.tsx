import React, { useEffect, useState } from 'react'
import './ComponentCard.css'


interface NodeData {
  id: string;
  originName: string;
  type: string;
  userDefineName: string;
  propertes: Record<string, any>;
  content: string;
}


const ComponentCard = ( {node} ) => {
  const [nodeData, setNodeData] = useState(node.getData()?.nodedata as NodeData);


  useEffect(() => {
    const update = () => setNodeData(node.getData()?.nodedata as NodeData)
    node.on('change:data', update)
    return () => node.off('change:data', update)
  }, [node])

  return (
     <div
      style={{
        width: '100%',
        height: '100%',
        border: '1px solid #409EFF',
        borderRadius: 6,
        padding: 8,
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 12, color: '#666' , pointerEvents: 'auto' }}>{nodeData.originName}</div>
    </div>

  )
}

export default ComponentCard;