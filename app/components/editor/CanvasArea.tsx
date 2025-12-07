import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Graph, Shape } from '@antv/x6'
import { Selection } from '@antv/x6-plugin-selection'
import { register } from '@antv/x6-react-shape'
import { v4 as uuidv4 } from 'uuid'

import './Editor.css';
import ComponentCard from './ComponentCard';
import { EditorService } from '@/app/biz/editor_service';
import ComponentTypeDO from '@/lib/Model/Editor/ComponentTypeDO';
import { useSelectedComponentStore } from '@/app/components/store/EditorStore';


interface CanvasProps {
    data:string;
    onDataSaved: (status: string) => void;
}

// 1. 定义 Ref Handle 类型 (与 A 组件的 CRefHandle 保持一致)
interface CRefHandle {
    executeSave: () => void;
    getCurrentData: () => string;
}

const CanvasArea = forwardRef<CRefHandle, CanvasProps>(({ onDataSaved }, ref) => {
  const selectedComponent = useSelectedComponentStore((state) => state.selectedComponent);
  const setSelectedComponent = useSelectedComponentStore((state) => state.setSelectedComponent);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [componentTypes, setComponentTypes] = useState<Record<string, ComponentTypeDO>>({});
  const componentTypesRef = useRef<Record<string, ComponentTypeDO>>({});

  useEffect(() => {
    const graph = graphRef.current
    if (!graph) return

    let spacePressed = false

    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spacePressed) {
        spacePressed = true
        graph.enablePanning()
        graph.container.style.cursor = 'grab'
      }
    }

    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressed = false
        graph.disablePanning()
        graph.container.style.cursor = 'default'
      }
    }

    document.addEventListener('keydown', down)
    document.addEventListener('keyup', up)

    return () => {
      document.removeEventListener('keydown', down)
      document.removeEventListener('keyup', up)
    }
  }, [graphRef])

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
  }, [componentTypes]); // 依赖 componentTypes，只要它变就更新 ref

  useEffect(()=>{
    const graph = graphRef.current;
    
    // 只有当 store 中有 ID 且数据对象不为 null 时才执行回写
    if (graph &&  selectedComponent && selectedComponent.componentId) {
      const node = graph.getCellById(selectedComponent.componentId);
      
      if (node) {
        // 使用 setData API 更新 X6 节点的数据
        // X6 会自动触发节点的渲染更新
        console.log(`ComponentA: 收到数据变更，更新节点 ${selectedComponent.componentId} 的数据为:`, selectedComponent);
         const nodedata = node.getData()?.nodedata
        if(nodedata.propertes == selectedComponent.properties){
          return
        }
       
        nodedata.propertes = selectedComponent.properties
        node.setData(nodedata); 
        // 确保 X6 视图更新 (根据 X6 版本和配置可能需要)
        //graph.trigger('node:change:data', { cell: node, current: selectedNodeData });
      }
    }
  },
   [selectedComponent])

     // 初始化图形
  useEffect(() => {
    const fetchComponentTypesData = async () => {
      const data = await EditorService.getInstance().queryComponentTypes() as Record<string, ComponentTypeDO>;
      setComponentTypes(data);
    }; 
    fetchComponentTypesData();

    if (!containerRef.current) return;

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



 console.log("graph 添加节点");
 const node = graph.addNode({
  shape: 'custom-react-node',
  x: 40,
  y: 40,
  width: 100, height: 40,
  data: { nodedata:{ id:uuidv4(),  originName: '初始值', color: '#409EFF' }},
   ports: [
        { id: `port_${uuidv4()}`, group: 'out' },
        { id: `port_${uuidv4()}`, group: 'in' },
      ],
})
console.log("graph 添加节点完成", node );

  graphRef.current = graph;

  graph.on('node:click', ({ node }) => {
    const currentTypes = componentTypesRef.current;    
    const typeId = node.getData()?.nodedata.componentTypeId;
    const selectComponent ={
        projectId: '',
        componentId: node.id,
        componentTypeId: typeId, 
        // ⭐️ 现在这里访问的是最新的值
        componentType: currentTypes[typeId] || null, 
        originName: node.getData()?.nodedata.originName || '',
        properties: node.getData()?.nodedata.propertes || {},
        

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


    return () => {
      graph.dispose();
    };
  }, []);

  

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const addNode =(componentId:string, offsetX:number, offsetY:number )=>{
    const graph = graphRef.current
    if (!graph) return
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
    if (!graph) return
    console.log('drop event:', e);
    const nodeData = JSON.parse(e.dataTransfer.getData('application/x6-node'))
    const { offsetX, offsetY } = e.nativeEvent

    addNode(nodeData.key as string, offsetX, offsetY);
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