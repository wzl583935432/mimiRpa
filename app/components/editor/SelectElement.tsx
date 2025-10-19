import React, { useState } from 'react';
import './SelectElement.css';
import { Modal, Input, Button } from 'antd';
import { AimOutlined } from '@ant-design/icons';
import {UiService} from '@/app/biz/ui_service'

interface SelectElementProps {
  initialText: string;
  onClose: (result: string | null) => void;
}


const UI_ELEMENT_NAMES = {
  'chromeUI': 'chrome浏览器元素',
  'windowsUI': 'windows桌面元素',
  // 可以根据需要添加更多类型
};

const SelectElement: React.FC<SelectElementProps> = ({initialText, onClose }) => {

    const [inputValue, setInputValue] = useState(initialText);

    const [uiElementType, setUiElementType] = useState<string | undefined>();

        // 辅助函数：根据当前类型获取要显示的名称
    const getElementName = (type) => {
        // 使用查找表获取名称
        const name = UI_ELEMENT_NAMES[type];
        
        // 如果在查找表中找到了对应的名称，则返回该名称；
        // 否则，返回一个默认值或提示信息。
        return name || `未选择`;
    };

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    // 确定并返回结果
    const handleSave = () => {
        onClose(inputValue);
    };

    const handleSelectTarget =async ()=>{

        const element =  await UiService.getInstance().startSelectElement()
        setUiElementType(element?.elementType)
    }

    // 取消操作，不返回结果
    const handleCancel = () => {
        onClose(null);
    };

  return (
    // ... 对话框内容和逻辑与上一个回答一致
  <Modal
      title="选中元素"
      width={'70%'}
      open={true} // 只要组件被渲染，Modal 就显示
      centered={true} // 🌟 关键：设置对话框居中
      onCancel={handleCancel} // 点击遮罩层或 X 触发取消
      footer={[
        // 自定义底部按钮
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          保存
        </Button>,
      ]}
    >
      <div>
         <Button 
            type="primary" 
            icon={<AimOutlined />} 
            size="large" 
            onClick={handleSelectTarget}
          >
            选择目标
          </Button>
        <p>元素类型：{getElementName(uiElementType)}</p>
        <p>请编辑您的目标文本:</p>
        <Input 
          value={inputValue} 
          onChange={handleChange} 
        />
      </div>
    </Modal>
  );
};

export default SelectElement;