import React, { useEffect, useState } from "react";
import { Select, message } from "antd";
import { ScheduleAPI } from "../../services/https";
import type { TimeStartInterface } from "../../interfaces/Schedule";
import './index.css';

const { Option } = Select;

interface SelectTimeEndProps {
  value: number | null;
  onChange: (value: number) => void;
}

const SelectTimeEnd: React.FC<SelectTimeEndProps> = ({ value, onChange }) => {
  const [timeOptions, setTimeOptions] = useState<TimeStartInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  
  const fetchTimes = async () => {
      try {
        const res = await ScheduleAPI.getTimeEnd();
        console.log("📅 Days Response:", res);
        
        if (Array.isArray(res.times)) {
          setTimeOptions(res.times);
        } else {
          messageApi.error("โหลดวันไม่สำเร็จ");
        }
      } catch (err) {
        console.error(err);
        messageApi.error("เกิดข้อผิดพลาดในการโหลดวัน");
      }
    };
  
    useEffect(() => {
      fetchTimes();
    }, []);
  

  return (
    <>
      {contextHolder}
    <Select
         className="custom-select-time-end"
         placeholder="เวลาจบ"
         value={value}
          onChange={(value) => {
            console.log("เลือก:", value);
            onChange(value);
          }}
       >
         {timeOptions.map((t) => (
           <Option key={t.id} value={t.id}>
             {t.period}
           </Option>
         ))}
       </Select>
    </>
  );
};

export default SelectTimeEnd;

