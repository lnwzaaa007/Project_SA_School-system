import React from 'react';
import { Select } from 'antd';

const ButtonSelect: React.FC = () => (
  <Select
    className="custom-select-day"
    showSearch
    placeholder="เริ่มคาบ"
    filterOption={(input, option) =>
      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
    }
    options={[
      { value: '1', label: '08.40' },
      { value: '2', label: '09.30' },
      { value: '3', label: '10.20' },
      { value: '4', label: '11.10' },
      { value: '5', label: '13.00' },
      { value: '6', label: '13.50' },
      { value: '7', label: '14.40' },
      { value: '8', label: '15.30' },
      
    ]}
  />
);

export default ButtonSelect;