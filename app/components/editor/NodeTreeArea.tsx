import React, {useEffect, useState} from 'react';
import { Tree, TreeProps } from 'antd';
import type { TreeDataNode } from 'antd';
import { CarryOutOutlined } from '@ant-design/icons';
import { EditorService } from '@/app/biz/editor_service';
import NodeDO from '@/lib/Model/Editor/NodeDO';


interface NodeTreeProb{
    setCollapsed: (iscollapsed:boolean)=> void;
}

export const NodeTreeArea : React.FC<NodeTreeProb> =  ({setCollapsed})=> {
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);


  const NodeDoToTreeDataNode = (nodedos:NodeDO[]):TreeDataNode[] =>{
    const treeDataNodes:TreeDataNode[] = [];
    nodedos.forEach((item)=>{
      if(!item){
        return;
      }
      const key = item.isLeaf? item.componentType:item.id
      const treeDataNode:TreeDataNode = {
        key: key,
        title:(<div>{item.originName} </div>),
        icon: <CarryOutOutlined />,
        isLeaf: item.isLeaf,
        children:[]
      }
      if(item.children){
        treeDataNode.children = NodeDoToTreeDataNode(item.children)
      }
      treeDataNodes.push(treeDataNode)
    })
    return treeDataNodes
  }

  useEffect(() => {
    const fetchTreeData = async () => {
      const data = await EditorService.getInstance().queryNodeTreeData() as NodeDO[];
      const treeDataNodes = NodeDoToTreeDataNode(data)
      setTreeData(treeDataNodes);
    }; 
    fetchTreeData();
    }, []); 

    
  const handleOnCollapsed = () =>{
    setCollapsed(!isLeftCollapsed)
    setIsLeftCollapsed(!isLeftCollapsed)
  }


  const onDragStart: TreeProps['onDragStart'] = (info) => {

    console.log('--------', info);
    const node = info.node;
    if (node.isLeaf) {
      info.event.dataTransfer.setData(
        'application/x6-node',
        JSON.stringify({ key: node.key}),
      );
    }
  };


  return (
    <div>
      <button 
          className="toggle-btn left-toggle"
          onClick={handleOnCollapsed}
        >
          {isLeftCollapsed ? '→' : '←'}
      </button>
      <Tree style={{ marginTop: "36px"}}
      showLine={true}
      draggable
      blockNode
      defaultExpandAll
      onDragStart={onDragStart}
      treeData={treeData}
    >
    </Tree>
    </div>

  );
}
