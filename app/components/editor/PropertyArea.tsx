import React, { useCallback, useEffect, useState } from 'react';
import { Form, message  } from 'antd';
import './Editor.css';
import { useSelectedComponentStore } from '../store/EditorStore';
import {InputRenderControl} from './InputRenderControl';

interface PropertyProb{
  setCollapsed: (iscollapsed:boolean)=> void; 
}


const PropertyArea : React.FC<PropertyProb> = ({setCollapsed}) => {
  const selectedComponent = useSelectedComponentStore((state) => state.selectedComponent);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const editComponentProperty = useSelectedComponentStore((state) => state.editComponentProperty);
  const [filedProperties, setFiledProperties] = useState(() =>{
    const mapproperties: Record<string, any> = {};
    const properties: Array<{ id: string; [key: string]: any }> = selectedComponent.componentType?.propertes ?? [];
    properties.forEach((config) => {
     mapproperties[config.id] = config;
    });
    return mapproperties;

  });
   // 1. 根据配置生成初始值并存入本地 state
  const [formData, setFormData] = useState(() => {
    const initialData: Record<string, any> = {};
    const properties: Array<{ id: string; [key: string]: any }> =
     selectedComponent.componentType?.propertes ?? [];
    properties.forEach((config) => {
      if(selectedComponent.properties[config.id])
        {
          initialData[config.id] = selectedComponent.properties[config.id];
        }else{
          initialData[config.id] = config.defaultValue;
        }

    });
    return initialData;
  });

  useEffect(()=>{
    const data: Record<string, any> = {};
    const properties: Array<{ id: string; [key: string]: any }> =
     selectedComponent.componentType?.propertes ?? [];
    properties.forEach((config) => {
      if(selectedComponent.properties[config.id])
        {
          data[config.id] = selectedComponent.properties[config.id];
        }else{
          data[config.id] = config.defaultValue;
        }

    });
    setFormData(data)
      
    const mapproperties: Record<string, any> = {};
    properties.forEach((config) => {
     mapproperties[config.id] = config;
    });
    setFiledProperties(mapproperties);

  },[selectedComponent])

  // 2. 字段值本地更新函数 (用于受控组件)
  const handleLocalValueChange = useCallback((fieldName) => (newValue) => {
    setFormData(prevData => ({
      ...prevData,
      [fieldName]: newValue,
    }));
        selectedComponent.properties[fieldName] = newValue
    editComponentProperty(fieldName, newValue);
  }, []);
  
  // 3. 核心逻辑：单个字段的更新处理函数（模拟提交）
  const handleFieldUpdate = useCallback(async (fieldName, newValue) => {
    // 乐观更新：先更新本地 state，提高用户体验
    // 注意：这里的 setFormData 已经在 RenderControl 中通过 onValueChange 提前执行了，
    // 但为了确保万一，或者处理 API 失败时的回滚，这里可以再次确认或进行专门处理。
    
    const config = filedProperties?.[fieldName];
    if(undefined === config){
      return;
    }
    selectedComponent.properties[config.id] = newValue
    editComponentProperty(config.id, newValue);
    // 调用 API 提交数据
    message.loading({ content: `${config?.name ?? fieldName} 正在保存...`, key: fieldName });
    try {
       message.success({ content: `${config?.name ?? fieldName} 保存成功！`, key: fieldName, duration: 2 });

    } catch (error) {
        message.error({ content: `${config?.name ?? fieldName} 保存出错！`, key: fieldName, duration: 2 });
    }
  }, [selectedComponent]);
      
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
        {Object.entries(selectedComponent.componentType?.propertes??[]).map(([id, config]) => (
          <Form.Item
            key={config.id}
            label={config.name} // 标题 (Title)
            // ⚠️ 注意：这里不使用 name 属性，因为我们手动管理值
            rules={[{ required: true, message: `请${config.type === 'select' ? '选择' : '输入'}${config.name}` }]}
            // 校验触发器：Select 用 change, Input 用 blur
            validateTrigger={config.type === 'select' || config.type === 'text' ? 'onChange' : 'onBlur'} 
          >
            <InputRenderControl
              fieldName={config.id}
              config={config}
              value={formData[config.id]}
              onValueChange={handleLocalValueChange(config.id)} // 局部状态更新
              onUpdate={handleFieldUpdate} // 提交事件
            />
          </Form.Item>
        ))}
      </Form>
    </div>
   
  );
}


export default PropertyArea;





