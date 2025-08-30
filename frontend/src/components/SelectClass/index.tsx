import React, { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { gradeAPI } from '../../services/https';
import type { GradeClassInterface } from '../../interfaces/Grade';
import './index.css';

const { Option } = Select;

interface SelectClass { 
  value: string | null;
  onChange: (value: string) => void;
}

const SelectClass: React.FC<SelectClass> = ({value, onChange}) => {
  const [class_, setClass_] = useState<GradeClassInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchGrades = async () => {
    try {
      const res = await gradeAPI.getClassesAll();
      if (Array.isArray(res)) {
        setClass_(res);
      } else {
        messageApi.error('ไม่พบข้อมูลชั้นปี');
      }
    } catch (err) {
      console.error('❌ โหลด grade ผิดพลาด:', err);
      messageApi.error('เกิดข้อผิดพลาด');
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  return (
    <>
      {contextHolder}
      <Select
        className="custom-select-grade"
        placeholder="เลือกห้อง"
        style={{ width: 300 }}
        showSearch
        value={value}
        optionFilterProp="children"
        onChange={(value) => {
          console.log("เลือก:", value);
          onChange(value);
       }}
      >
        {class_.map((g) => (
          <Option key={g.ID} value={`${g.grade_class}`}>
            ห้อง {g.grade_class}
          </Option>
        ))}
      </Select>
    </>
  );
};

export default SelectClass;
     
