import React from 'react';
import { Select } from 'antd';

const ButtonSelect: React.FC = () => (
  <Select
    className="custom-select-day"
    showSearch
    placeholder="เลือกวัน"
    filterOption={(input, option) =>
      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
    }
    options={[
      { value: '1', label: 'จ.' },
      { value: '2', label: 'อ.' },
      { value: '3', label: 'พ.' },
      { value: '4', label: 'พฤ.' },
      { value: '5', label: 'ศ.' },
      
    ]}
  />
);

export default ButtonSelect;