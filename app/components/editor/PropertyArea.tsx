import React, { useCallback, useEffect, useState } from 'react';
import { Form, message  } from 'antd';
import './Editor.css';
import { useSelectedComponentStore } from '../store/EditorStore';
import {InputRenderControl} from './InputRenderControl';




function PropertyArea() {
  const selectedComponent = useSelectedComponentStore((state) => state.selectedComponent);

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
    const properties: Array<{ id: string; [key: string]: any }> = selectedComponent.componentType?.propertes ?? [];
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
    const properties: Array<{ id: string; [key: string]: any }> = selectedComponent.componentType?.propertes ?? [];
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


  return (
    <Form
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
    >
      <h2>动态配置表单 (失焦自动提交)</h2>

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
      
      <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <p style={{ color: '#888' }}>
              * 文本输入框在**失去焦点**后自动保存。<br/>
              * 下拉选项框在**选择新值**后自动保存。
          </p>
      </Form.Item>
      
      <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <h3>当前本地 State</h3>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
      </Form.Item>

    </Form>
  );
}


export default PropertyArea;





