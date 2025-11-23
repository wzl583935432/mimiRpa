import React, { useCallback, useState } from 'react';
import { Input, Select, Button } from 'antd';

import { AimOutlined } from '@ant-design/icons';
import SelectElement from './SelectElement';
/**
 * 核心渲染函数：根据配置对象的 type 字段渲染 antd 输入组件，并处理事件
 * * @param {string} fieldName - 字段名称（key）
 * @param {object} config - 字段配置（包含 type, options, placeholder 等）
 * @param {any} value - 当前字段的值
 * @param {function} onValueChange - 更新本地状态的函数 (newValue => void)
 * @param {function} onUpdate - 触发字段提交/更新的函数 (fieldName, newValue => Promise)
 */
export const InputRenderControl = ({ fieldName, config, value, onValueChange, onUpdate }) => {
  const { inputType, options, placeholder, rows } = config;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [itemValue, setItemValue] = useState(value);
  // 所有文本输入的 onChange，用于更新本地 state
  const handleTextChange = useCallback((e) => {
      onValueChange(e.target.value);
  }, [onValueChange]);

  // 统一的文本输入框失去焦点处理函数 (Input/TextArea)
  const handleBlur = useCallback((e) => {
    const finalValue = e.target.value;
    // 只有当值与当前 state 值不同时才触发提交
    if (finalValue !== value) {
        onUpdate(fieldName, finalValue);
    }
  }, [fieldName, onUpdate, value]);

  // Select 的值改变处理函数 (Select 通常用 onChange 即时提交)
  const handleSelectChange = useCallback((newValue) => {
    onValueChange(newValue); // 先更新本地状态
    onUpdate(fieldName, newValue); // 立即触发提交/更新
  }, [fieldName, onUpdate, onValueChange]);

const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  // 处理对话框关闭和结果返回的回调函数
  const handleCloseDialog = (result) => {
    setIsDialogOpen(false);
    if (result) {

      if (result !== value) {
        onUpdate(fieldName, result);
      }
      // 接收到结果，更新当前界面的状态
      setItemValue(result);
    }
  };

  switch (inputType) {
    case 'text':
      return (
        <Input 
          value={itemValue} 
          onChange={handleTextChange}
          onBlur={handleBlur} // 失去焦点时触发提交
          placeholder={placeholder || `请输入${config.name}`}
        />
      );
      
    case 'textarea':
      return (
        <Input.TextArea 
          value={itemValue} 
          onChange={handleTextChange}
          onBlur={handleBlur} // 失去焦点时触发提交
          rows={rows || 2}
          placeholder={placeholder || `请输入${config.name}`}
        />
      );

    case 'select':
      return (
        <Select 
          value={itemValue}
          onChange={handleSelectChange} // 值改变时触发提交
          placeholder={placeholder || `请选择${config.name}`}
          options={options} 
        />
      );

    case 'targetElement':
      return (
        <div style={{ padding: '20px' }}>
           <Button 
            type="primary" 
            // ✅ 正确的使用：AimOutlined
            icon={<AimOutlined />} 
            size="large" 
            onClick={handleOpenDialog}
          >
            编辑目标
          </Button>

          {isDialogOpen && (
            <SelectElement
              initialText={itemValue}
              onClose={handleCloseDialog}
            />
          )}

        </div>
       
      );

    default:
      return <Input disabled value={`不支持的配置类型: ${inputType}`} />;
  }
};

