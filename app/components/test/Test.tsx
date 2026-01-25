import PythonScriptEditor from './PythonScriptEditor';
import React, { useCallback, useRef, useState } from 'react';

const Test = () => {
    const [value, setValue] = useState("");
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
        <PythonScriptEditor value={value} onChange={setValue} />

        这是一个测试组件
    </div>
  );
}
export default Test;