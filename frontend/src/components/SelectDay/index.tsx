

import React, { useEffect, useState } from "react";
import { Select, message } from "antd";
import { ScheduleAPI } from "../../services/https";
import type { DayInterface } from "../../interfaces/Schedule";
import './index.css';

const { Option } = Select;

interface SelectdayProps {
  value: string | null;
  onChange: (value: string) => void;
}

const Selectday: React.FC<SelectdayProps> = ({ value, onChange }) => {
  const [dayOptions, setDayOptions] = useState<DayInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

   const fetchDays = async () => {
    try {
      const res = await ScheduleAPI.getDays();
       if (Array.isArray(res)) {
        setDayOptions(res);
      } else {
        messageApi.error("โหลดวันไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("เกิดข้อผิดพลาดในการโหลดวัน");
    }
  };

  useEffect(() => {
    fetchDays();
  }, []);

  return (
    <>
      {contextHolder}
      <Select
        className="custom-select-day"
        placeholder="เลือกวัน"
        value={value}
        onChange={(value) => {
          console.log("เลือก:", value);
          onChange(value);
        }}
      >
        {dayOptions.map((d) => (
          <Option key={d.ID} value={d.thai_day}>
          {d.thai_day}
          </Option>

        ))}
      </Select>
    </>
  );
};

export default Selectday;
