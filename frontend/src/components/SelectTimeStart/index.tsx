// import React from 'react';
// import { Select } from 'antd';

// const ButtonSelect: React.FC = () => (
//   <Select
//     className="custom-select-day"
//     showSearch
//     placeholder="เริ่มคาบ"
//     filterOption={(input, option) =>
//       (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
//     }
//     options={[
//       { value: '1', label: '08.40' },
//       { value: '2', label: '09.30' },
//       { value: '3', label: '10.20' },
//       { value: '4', label: '11.10' },
//       { value: '5', label: '13.00' },
//       { value: '6', label: '13.50' },
//       { value: '7', label: '14.40' },
//       { value: '8', label: '15.30' },
      
//     ]}
//   />
// );

// export default ButtonSelect;

import React, { useEffect, useState } from "react";
import { Select, message } from "antd";
import { enumScheduleAPI } from "../../services/https";
import './index.css';

const { Option } = Select;

interface SelectTimeStartProps {
  value: string | null;
  onChange: (value: string) => void;
}

const SelectTimeStart: React.FC<SelectTimeStartProps> = ({value, onChange }) => {
  const [timeOptions, setTimeOptions] = useState<string[]>([]);
    
    const fetchTimes = async () => {
        try {
          const res = await enumScheduleAPI.getTimes();
          console.log("📅 Days Response:", res);
          
          if (Array.isArray(res.times)) {
            setTimeOptions(res.times);
          } else {
            message.error("โหลดวันไม่สำเร็จ");
          }
        } catch (err) {
          console.error(err);
          message.error("เกิดข้อผิดพลาดในการโหลดวัน");
        }
      };
    
      useEffect(() => {
        fetchTimes();
      }, []);

  return (
    <Select
      className="custom-select-time-start"
      placeholder="เวลาเริ่ม"
      value={value}
      onChange={(value) => {
        console.log("เลือก:", value);
        onChange(value);
      }}
    >
    {timeOptions.map((time) => (
      <Option key={time} value={time}>
        {time}
      </Option>
    ))}
  </Select>
  );
};

export default SelectTimeStart;
