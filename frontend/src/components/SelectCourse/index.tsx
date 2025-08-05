import React from 'react';
import { Select } from 'antd';
import './index.css';
const options = [
  { value: '1', label: 'Jack' },
  { value: '2', label: 'Lucy' },
  { value: '3', label: 'Tom' },
];

const ButtonSelect: React.FC = () => {
  const handleChange = (value: string, option: any) => {
    console.log('Selected value:', value); // value เช่น '1'
    console.log('Selected label:', option.label); // label เช่น 'Jack'
    
  };

  return (
    <Select
     className="custom-select-course"
      showSearch
      placeholder="รายวิชา"
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={options}
      onChange={handleChange}

    />
  );
};

export default ButtonSelect;
