import React, { useCallback, useEffect, useState } from 'react';
import { Form, message  } from 'antd';
import './Editor.css';
import { useSelectedNodeStore } from '../store/EditorStore';
import {InputRenderControl} from './InputRenderControl';
import {WorkflowEditorBiz} from '@/app/biz/workflow_editor_biz'

interface PropertyProb{
  setCollapsed: (iscollapsed:boolean)=> void; 
}


const PropertyArea : React.FC<PropertyProb> = ({setCollapsed}) => {
  const selectedComponent = useSelectedNodeStore((state) => state.selectedValue);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const [filedProperties, setFiledProperties] = useState({});
   // 1. 根据配置生成初始值并存入本地 state
  const [formData, setFormData] = useState({});

  const queryProperties = async (projectId, projectVersion, nodeId) =>{
    const workflowEditorBiz:WorkflowEditorBiz = new WorkflowEditorBiz(projectId, projectVersion);
    return await workflowEditorBiz.QueryNodeProperties(nodeId);
  }

  const updateProperties = async (projectId, projectVersion, nodeId, data) =>{
    const workflowEditorBiz:WorkflowEditorBiz = new WorkflowEditorBiz(projectId, projectVersion);
    return await workflowEditorBiz.saveNodeProperties(nodeId, data);
  }

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!selectedComponent) return;

      const data: Record<string, any> = {};
      const properties = selectedComponent.componentType?.propertes ?? [];

      const oldProperties = await queryProperties(
        selectedComponent.projectId,
        selectedComponent.projectVersion,
        selectedComponent.nodeId
      );

      if (cancelled) return;

      const oldMap = new Map<string, any>();
      oldProperties?.forEach(item => {
        oldMap.set(item.propertyName, item.propertyValue);
      });

      properties.forEach(config => {
        data[config.id] = oldMap.has(config.id)
          ? oldMap.get(config.id)
          : config.defaultValue;
      });

      setFormData(data);

      const fieldMap: Record<string, any> = {};
      properties.forEach(c => (fieldMap[c.id] = c));
      setFiledProperties(fieldMap);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [selectedComponent]);

  // 2. 字段值本地更新函数 (用于受控组件)
  const handleLocalValueChange = useCallback((fieldName) => (newValue) => {
   // setFormData(prevData => ({
   //   ...prevData,
    //  [fieldName]: newValue,
   // }));

  }, []);
  
  // 3. 核心逻辑：单个字段的更新处理函数（模拟提交）
  const handleFieldUpdate = useCallback(async (currentComponent, fieldName, newValue) => {
    // 乐观更新：先更新本地 state，提高用户体验
    // 注意：这里的 setFormData 已经在 RenderControl 中通过 onValueChange 提前执行了，
    // 但为了确保万一，或者处理 API 失败时的回滚，这里可以再次确认或进行专门处理。
    
    const config = filedProperties?.[fieldName];
    if(!config){
      return;
    }

    if(selectedComponent.projectId!== currentComponent.projectId ||
      selectedComponent.projectVersion!==currentComponent.projectVersion ||
      selectedComponent.nodeId!== currentComponent.nodeId){
      return;
    }

    const oldValue = formData[fieldName]
    if(oldValue === newValue){
      return;
    }

    const udpateData:Record<string, string> = {}
    udpateData[fieldName] = newValue;
    const isok = await updateProperties(selectedComponent.projectId,
       selectedComponent.projectVersion,
        selectedComponent.nodeId,
         udpateData)
    if(isok){
      message.success({ content: `${config?.name ?? fieldName} 保存成功！`, key: fieldName, duration: 2 });
      const newFromData = {
      ...formData,
      [fieldName]: newValue,
      }
      setFormData(newFromData)
    }else{
       message.error({ content: `${config?.name ?? fieldName} 保存出错！`, key: fieldName, duration: 2 });
    }
  }, [selectedComponent, formData, filedProperties]);
      
  const handleOnCollapsed = () =>{
    setCollapsed(!isRightCollapsed)
    setIsRightCollapsed(!isRightCollapsed)
  }

  return (
    <div>
        <button 
          className="toggle-btn right-toggle"
          onClick={handleOnCollapsed}
        >
          {isRightCollapsed ? '←' : '→'}
        </button>
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 , marginTop: "36px" }}
      >
        {/* 遍历配置数据，动态渲染 Form.Item */}
        {(selectedComponent.componentType?.propertes ?? []).map((config) => (
            <Form.Item
              key={config.id}
              label={config.name}
              rules={[
                {
                  required: true,
                  message: `请${config.type === 'select' ? '选择' : '输入'}${config.name}`,
                },
              ]}
              validateTrigger={
                config.type === 'select' || config.type === 'text'
                  ? 'onChange'
                  : 'onBlur'
              }
            >
              <InputRenderControl
                component={selectedComponent}
                fieldName={config.id}
                config={config}
                value={formData[config.id]}
                onValueChange={handleLocalValueChange(config.id)}
                onUpdate={handleFieldUpdate}
              />
            </Form.Item>
          ))}

      </Form>
    </div>
   
  );
}


export default PropertyArea;





