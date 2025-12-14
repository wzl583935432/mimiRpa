import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Graph, Shape } from '@antv/x6'
import { Selection } from '@antv/x6-plugin-selection'
import { register } from '@antv/x6-react-shape'
import { v4 as uuidv4 } from 'uuid'

import './Editor.css';
import ComponentCard from './ComponentCard';
import { ComponentService } from '@/app/biz/component_service';
import ComponentTypeDO from '@/lib/Model/Editor/ComponentTypeDO';
import { useSelectedNodeStore, SelectedNode, SelectType } from '@/app/components/store/EditorStore';
import {WorkflowEditorBiz} from "@/app/biz/workflow_editor_biz"



interface CanvasProps {
    projectId:string;
    version:string;
    graphId:string,
    onDataSaved: (status: string) => void;
}

// 1. 定义 Ref Handle 类型 (与 A 组件的 CRefHandle 保持一致)
interface CRefHandle {
    executeSave: () => void;
    getCurrentData: () => string;
}

const CanvasArea = forwardRef<CRefHandle, CanvasProps>(({ graphId, projectId, version, onDataSaved }, ref) => {
  const workflowEditorBiz = new WorkflowEditorBiz(projectId, version)
  const selectedComponent = useSelectedNodeStore((state) => state.selectedValue);
  const setSelectedComponent = useSelectedNodeStore((state) => state.setSelectedNode);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [componentTypes, setComponentTypes] = useState<Record<string, ComponentTypeDO>>({});
  const componentTypesRef = useRef<Record<string, ComponentTypeDO>>({});



  // C 内部的保存逻辑
  const executeSave = useCallback(() => {
    console.log("执行保存")
    // 模拟异步保存
    setTimeout(() => {

      // 3. 将最终结果通过回调传回给 A
      onDataSaved(""); 
    }, 500);
  }, [onDataSaved]);

  // 4. 使用 useImperativeHandle 将方法暴露给父组件 A
  useImperativeHandle(ref, () => ({
    executeSave, // 暴露执行保存的函数
    getCurrentData: () => {
      const graph = graphRef.current;
      if(graph){
        return JSON.stringify(graph.toJSON())
      }
      return "{}"

    }, // 暴露获取数据的方法
  }));


  useEffect(() => {
    componentTypesRef.current = componentTypes;
  }, [componentTypes]); 

  const fetchComponentTypesData = async () => {
    const data = await ComponentService.getInstance().queryComponentTypes() as Record<string, ComponentTypeDO>;
    setComponentTypes(data);
  }; 

  const initComponentCard =()=>{
    register({
      shape: 'custom-react-node',
      width: 100,
      height: 100,
      component: ComponentCard,
      ports: {
        groups: {
          in: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          },
          out: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          },
        },
    },
    })
  }

  const createGraph =():Graph|null=>{
    if (!containerRef.current) {
          return null
        }

    // 创建图形实例
    const graph = new Graph({
      container: containerRef.current,
      autoResize: true, 
      grid: {
        size: 10,
        visible: true,
      },
      panning: {
        enabled: true,
        modifiers: 'shift',
      },
      mousewheel: {
        enabled: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        snap: {
          radius: 20,
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#A2B1C3',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 0,
          });
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet;
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#5F95FF',
              stroke: '#5F95FF',
            },
          },
        },
      },
    });

    
    graph.use(
      new Selection({
        enabled: true,
        multiple: false,          // 是否允许多选
        rubberband: true,          // 是否允许拖框选
        showNodeSelectionBox: true, // 显示节点被选中的框
        showEdgeSelectionBox: false, // 是否对边显示选中框
        filter:["edge","node"],   // 过滤不需要被选中的元素
        // 你还可以设置 filter、strict 等其他选项
      })
    )

    
    graph.on('node:click', ({ node }) => {
      const currentTypes = componentTypesRef.current;    
      const typeId = node.getData()?.nodedata.componentTypeId;
      const alias = node.getData()?.nodedata.alias;
      const selectComponent:SelectedNode ={
          projectId: projectId,
          projectVersion: version,
          selectType:SelectType.Node,
          nodeId: node.id,
          alias: alias,
          componentTypeId: typeId, 
          // ⭐️ 现在这里访问的是最新的值
          componentType: currentTypes[typeId] || null, 

      };
      setSelectedComponent(selectComponent);

    console.log('Node clicked:', node.id);
      })
        // 监听选中事件
    graph.on('node:selected', ({ node }) => {
      console.log('node selected:', node.id);
    });

    // 监听选中事件
    graph.on('cell:selected', ({ cell }) => {
      console.log('Cell selected:', cell.id);
    });

    graph.on('node:selected', ({ node }) => {
      node.attr({
        body: {
          stroke: '#1677ff',
          strokeWidth: 2,
        },
      })
    })

    graph.on('node:unselected', ({ node }) => {
      node.attr({
        body: {
          stroke: '#d9d9d9',
          strokeWidth: 1,
        },
      })
    })

    // 监听取消选中事件
    graph.on('cell:unselected', () => {
      console.log('Cell unselected');
    });

    // 监听属性变化事件
    graph.on('cell:change:attrs', ({ cell }) => {
      console.log('Cell attributes changed:', cell.id);
    });

    // 监听尺寸变化事件
    graph.on('cell:change:size', ({ cell }) => {
      console.log('Cell size changed:', cell.id);
    });
   
    return graph;
  }

  const getStartNode = (graph: Graph) => {
  return graph.getNodes().find(node => {
    return node.getData()?.componentTypeId === 'start';
  });
}

  const initGraph = async ()=>{
    const graphData = await workflowEditorBiz.queryEditorGraphData(graphId);
    if(graphRef.current)
    {
      return;
    }
    await fetchComponentTypesData();
    initComponentCard()
    const graph = createGraph();
    if(null == graph){
      return
    }
    try{
      if(graphData?.content){
        const graphJson = JSON.parse(graphData.content);
        graph.fromJSON(graphJson)
      }
    }
    catch(err){
      console.error(err);
    }

    if(!getStartNode(graph)){
      const node = graph.addNode({
        shape: 'custom-react-node',
        x: 40,
        y: 40,
        width: 100, height: 40,
        data: { nodedata:{ id:uuidv4(), componentTypeId:'start',  originName: '初始值', color: '#409EFF' }},
        ports: [
              { id: `port_${uuidv4()}`, group: 'out' }
            ],
      })
      console.log("graph 添加开始节点完成", node );
    }
    graphRef.current = graph;


  }


  // 初始化图形
  useEffect(() => {
    initGraph()
    return () => {
      graphRef.current?.dispose();
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const addNode =(componentId:string, offsetX:number, offsetY:number )=>{
    const graph = graphRef.current
    if (!graph) 
    {
      return;
    }
    const component = componentTypes[componentId];  

    graph.addNode({
      shape: 'custom-react-node',
      x: offsetX,
      y: offsetY,
      width: 100,
      height: 40,
      label: component.originName,
      data: { nodedata:{ id:uuidv4(), 
         originName: component.originName,
         alias: component.originName,
         color: '#409EFF', 
         componentTypeId: component.id,
         propertes: {} }},
      ports: [
        { id: `port_${uuidv4()}`, group: 'out' },
        { id: `port_${uuidv4()}`, group: 'in' },
      ],
    })

  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const graph = graphRef.current
    if (!graph) {
      return;
    }
    const nodeData = JSON.parse(e.dataTransfer.getData('application/x6-node'))
    const { offsetX, offsetY } = e.nativeEvent

    addNode(nodeData.key as string, offsetX, offsetY);
    const data = JSON.stringify(graph.toJSON());
    workflowEditorBiz.saveEditorGraphData(graphId, data);
  }

  return (
    <div className="menuArea-container" 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div ref={containerRef} id="graph-container" />
    </div>
  );
});

export default CanvasArea;