import React, { useCallback, useEffect, useState } from 'react';
import { Input, Select, Button } from 'antd';
import { AimOutlined } from '@ant-design/icons';
import SelectElement from './SelectElement';

interface InputRenderControlProps {
  component: any;
  fieldName: string;
  config: {
    inputType: string;
    options?: any[];
    placeholder?: string;
    rows?: number;
    name?: string;
  };
  value: any;
  onValueChange?: (val: any) => void; // 可选：仅用于父组件同步显示
  onUpdate: (component: any, field: string, val: any) => void;
}

export const InputRenderControl: React.FC<InputRenderControlProps> = ({
  component,
  fieldName,
  config,
  value,
  onValueChange,
  onUpdate,
}) => {
  const { inputType, options, placeholder, rows, name } = config;

  const [itemValue, setItemValue] = useState<any>(value);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /** 外部 value 变化 → 同步本地（如切换节点） */
  useEffect(() => {
    setItemValue(value);
  }, [value]);

  /** 文本输入 */
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setItemValue(val);
    onValueChange?.(val);
  }, [onValueChange]);

  /** 失焦提交 */
  const handleBlur = useCallback(() => {
    if (itemValue !== value) {
      onUpdate(component, fieldName, itemValue);
    }
  }, [component, fieldName, itemValue, value, onUpdate]);

  /** Select 直接提交 */
  const handleSelectChange = useCallback((val: any) => {
    setItemValue(val);
    onValueChange?.(val);
    onUpdate(component, fieldName, val);
  }, [component, fieldName, onUpdate, onValueChange]);

  /** Dialog */
  const handleCloseDialog = useCallback((result?: any) => {
    setIsDialogOpen(false);
    if (result !== undefined && result !== itemValue) {
      setItemValue(result);
      onUpdate(component, fieldName, result);
    }
  }, [component, fieldName, itemValue, onUpdate]);

  switch (inputType) {
    case 'text':
      return (
        <Input
          value={itemValue}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder || `请输入${name ?? ''}`}
        />
      );

    case 'textarea':
      return (
        <Input.TextArea
          value={itemValue}
          onChange={handleTextChange}
          onBlur={handleBlur}
          rows={rows ?? 2}
          placeholder={placeholder || `请输入${name ?? ''}`}
        />
      );

    case 'select':
      return (
        <Select
          value={itemValue}
          options={options}
          onChange={handleSelectChange}
          placeholder={placeholder || `请选择${name ?? ''}`}
        />
      );

    case 'targetElement':
      return (
        <>
          <Button
            type="primary"
            icon={<AimOutlined />}
            onClick={() => setIsDialogOpen(true)}
          >
            编辑目标
          </Button>

          {isDialogOpen && (
            <SelectElement
              initialText={itemValue}
              onClose={handleCloseDialog}
            />
          )}
        </>
      );

    default:
      return <Input disabled value={`不支持的类型: ${inputType}`} />;
  }
};
