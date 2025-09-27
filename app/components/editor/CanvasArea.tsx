import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Graph, Shape } from '@antv/x6'


import './Editor.css';



const CanvasArea: React.FC = () => {
     const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);


     // 初始化图形
  useEffect(() => {
    if (!containerRef.current) return;

    // 创建图形实例
    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current?.offsetWidth || 800,
      height: containerRef.current?.offsetHeight || 600,
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

    graphRef.current = graph;



    // 监听选中事件
    graph.on('cell:selected', ({ cell }) => {

    });

    // 监听取消选中事件
    graph.on('cell:unselected', () => {
   
    });

    // 监听属性变化事件
    graph.on('cell:change:attrs', ({ cell }) => {

    });

    // 监听尺寸变化事件
    graph.on('cell:change:size', ({ cell }) => {

    });

    return () => {
      graph.dispose();
    };
  }, []);

  return (
    <div className="menuArea-container">
        <div ref={containerRef} id="graph-container" />
    </div>
  );
};

export default CanvasArea;