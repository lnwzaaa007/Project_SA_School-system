// import React from 'react';
// import { Select } from 'antd';

// const ButtonSelect: React.FC = () => (
//   <Select
//     className="custom-select-day"
//     showSearch
//     placeholder="เลือกวัน"
//     filterOption={(input, option) =>
//       (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
//     }
//     options={[
//       { value: '1', label: 'จ.' },
//       { value: '2', label: 'อ.' },
//       { value: '3', label: 'พ.' },
//       { value: '4', label: 'พฤ.' },
//       { value: '5', label: 'ศ.' },
      
//     ]}
//   />
// );

// export default ButtonSelect;

import React, { useEffect, useState } from "react";
import { Select, message } from "antd";
import { enumScheduleAPI } from "../../services/https";
import './index.css';

const { Option } = Select;

interface SelectdayProps {
  value: string | null;
  onChange: (value: string) => void;
}

const Selectday: React.FC<SelectdayProps> = ({ value, onChange }) => {
  const [dayOptions, setDayOptions] = useState<string[]>([]);


   const fetchDays = async () => {
    try {
      const res = await enumScheduleAPI.getDays();
      console.log("📅 Days Response:", res);
      
      if (Array.isArray(res.days)) {
        setDayOptions(res.days);
      } else {
        message.error("โหลดวันไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการโหลดวัน");
    }
  };

  useEffect(() => {
    fetchDays();
  }, []);

  return (
    <Select
      className="custom-select-day"
      placeholder="เลือกวัน"
      value={value}
       onChange={(value) => {
        console.log("เลือก:", value);
        onChange(value);
      }}
    >
      {dayOptions.map((day) => (
        <Option key={day} value={day}>
          {day}
        </Option>
      ))}
    </Select>
  );
};

export default Selectday;
