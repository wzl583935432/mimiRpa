import React, {useEffect, useState} from 'react';
import { Tree, TreeProps } from 'antd';
import { FileOutlined, FolderOutlined } from '@ant-design/icons';
import { EditorService } from '@/app/biz/editor_service';
import NodeDO from '@/lib/Model/Editor/NodeDO';

const { TreeNode  } = Tree;


export const NodeTreeArea =  ()=> {
  const [treeData, setTreeData] = useState<NodeDO[]>([]);
  useEffect(() => {
    const fetchTreeData = async () => {
      const data = await EditorService.getInstance().queryNodeTreeData() as NodeDO[];
      setTreeData(data);
    }; 
    fetchTreeData();
    }, []); 

// 渲染节点，叶子节点前加 File 图标，目录节点前加 Folder 图标
function renderTreeNodes(data: any[]) {
  return data.map((item) => {
    const nodeTitle = (
      <span>
        {item.isLeaf ? <FileOutlined style={{ marginRight: 6 }} /> : <FolderOutlined style={{ marginRight: 6 }} />}
        {item.originName}
      </span>
    );

    const nodeProps = {
      key: item.componentType,
      title: nodeTitle,
      name: item.originName,
      isLeaf: item.isLeaf,
      draggable: !!item.isLeaf, // 只有叶子能拖拽
    };

    if (item.children) {
      return <TreeNode {...nodeProps}>{renderTreeNodes(item.children)}</TreeNode>;
    }
    return <TreeNode {...nodeProps} />;
  });
}

const onDragStart: TreeProps['onDragStart'] = (info) => {
    const node = info.node;
    if (node.isLeaf) {
      info.event.dataTransfer.setData(
        'application/x6-node',
        JSON.stringify({ key: node.key}),
      );
    }
 
  };


  return (
    <Tree
      draggable
      blockNode
      defaultExpandAll
      onDragStart={onDragStart}
    >
      {renderTreeNodes(treeData)}
    </Tree>
  );
}
