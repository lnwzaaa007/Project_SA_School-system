// import React from 'react';
// import { Select } from 'antd';

// const ButtonSelect: React.FC = () => (
//   <Select
//     className="custom-select-day"
//     showSearch
//     placeholder="จบคาบ"
//     filterOption={(input, option) =>
//       (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
//     }
//     options={[
//       { value: '1', label: '09.30' },
//       { value: '2', label: '10.20' },
//       { value: '3', label: '11.10'},
//       { value: '4', label: '12.00' },
//       { value: '5', label: '13.50' },
//       { value: '6', label: '14.40' },
//       { value: '7', label: '15.30' },
//       { value: '8', label: '16.30' },
      
//     ]}
//   />
  
// );

// export default ButtonSelect;

import React from "react";
import { Select } from "antd";

interface SelectTimeEndProps {
  value: string;
  onChange: (value: string) => void;
}

const SelectTimeEnd: React.FC<SelectTimeEndProps> = ({ value, onChange }) => {
  const options = [
    { label: "09:00", value: "09:00" },
    { label: "10:00", value: "10:00" },
    { label: "11:00", value: "11:00" },
    { label: "12:00", value: "12:00" },
    { label: "14:00", value: "14:00" },
    { label: "15:00", value: "15:00" },
    { label: "16:00", value: "16:00" },
  ];

  return (
    <Select
      placeholder="เวลาสิ้นสุด"
      style={{ width: 100 }}
      value={value}
      onChange={onChange}
      options={options}
    />
  );
};

export default SelectTimeEnd;

