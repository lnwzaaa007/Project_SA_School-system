import React from 'react';
import { Select } from 'antd';
import './index.css';
const options = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
];

const ButtonSelect: React.FC = () => {
  const handleChange = (value: string, option: any) => {
    console.log('Selected value:', value); // value เช่น '1'
    console.log('Selected label:', option.label); // label เช่น 'Jack'
    
  };

  return (
    <Select
     className="custom-select-class"
      showSearch
      placeholder="ห้อง"
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={options}
      onChange={handleChange}

    />
  );
};

export default ButtonSelect;
