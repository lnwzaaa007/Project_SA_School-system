import React from 'react';
import { Select } from 'antd';
import './index.css';
const options = [
  { value: '1', label: 'มัธยมศึกษาปีที่ 1' },
  { value: '2', label: 'มัธยมศึกษาปีที่ 2' },
  { value: '3', label: 'มัธยมศึกษาปีที่ 3' },
  { value: '4', label: 'มัธยมศึกษาปีที่ 4' },
  { value: '5', label: 'มัธยมศึกษาปีที่ 5' },
  { value: '6', label: 'มัธยมศึกษาปีที่ 6' },
];

const ButtonSelect: React.FC = () => {
  const handleChange = (value: string, option: any) => {
    console.log('Selected value:', value); // value เช่น '1'
    console.log('Selected label:', option.label); // label เช่น 'Jack'
    
    // คุณสามารถส่งไปหลังบ้านตรงนี้ได้ เช่น
    // axios.post('/api/save-selection', { value });
  };

  return (
    <Select
     className="custom-select-grade"
      showSearch
      placeholder="ชั้นปี"
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={options}
      onChange={handleChange}

    />
  );
};

export default ButtonSelect;
