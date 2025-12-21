import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
  onValueChange?: (val: any) => void; // 父级：编辑中同步
  onUpdate: (component: any, field: string, val: any) => void; // 父级：最终保存
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

  /** 本地编辑态（唯一渲染源） */
  const [itemValue, setItemValue] = useState<any>("");

  /** Dialog 状态 */
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /** 是否正在编辑（防止父级 value 覆盖输入） */
  const isEditingRef = useRef(false);

  /* ==================== 核心提交函数（统一出口） ==================== */

  const commitValue = () => {
    
    if (itemValue !== value) {
      onUpdate(component, fieldName, itemValue);
    }
    isEditingRef.current = false;
  }

  /* ==================== 外部 value 同步 ==================== */

  useEffect(() => {
    if (!isEditingRef.current && value !== itemValue) {
      setItemValue(value);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ==================== 卸载兜底保存（🔥关键） ==================== */

  useEffect(() => {
    return () => {
      if (itemValue !== value) {
        onUpdate(component, fieldName, itemValue);
      }
    };
  }, []); // 只在卸载时执行

  /* ==================== 输入处理 ==================== */

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      isEditingRef.current = true;
      setItemValue(val);
      onValueChange?.(val);
    },
    [onValueChange],
  );

  const handleSelectChange = useCallback(
    (val: any) => {
      isEditingRef.current = false;
      setItemValue(val);
      onValueChange?.(val);
      onUpdate(component, fieldName, val); // Select 直接提交
    },
    [component, fieldName, onUpdate, onValueChange],
  );

  const handleCloseDialog = useCallback(
    (result?: any) => {
      setIsDialogOpen(false);
      if (result !== undefined && result !== itemValue) {
        isEditingRef.current = false;
        setItemValue(result);
        onValueChange?.(result);
        onUpdate(component, fieldName, result);
      }
    },
    [component, fieldName, itemValue, onUpdate, onValueChange],
  );

  /* ==================== 渲染 ==================== */

  switch (inputType) {
    case 'text':
      return (
        <Input
          value={itemValue}
          onChange={handleTextChange}
          onBlur={commitValue}
          onPressEnter={commitValue}
          onMouseDownCapture={commitValue} // 🔥 防止 blur 被吃
          placeholder={placeholder || `请输入${name ?? ''}`}
        />
      );

    case 'textarea':
      return (
        <Input.TextArea
          value={itemValue}
          onChange={handleTextChange}
          onBlur={commitValue}
          onMouseDownCapture={commitValue}
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
      return (
        <Input
          disabled
          value={`不支持的类型: ${inputType}`}
        />
      );
  }
};
