import React, { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { gradeAPI } from '../../services/https';
import type { GradeYearInterface } from '../../interfaces/Grade';
import './index.css';

const { Option } = Select;

interface SelectGrade {
  value: number | null;
  onChange: (value: number) => void;
}

const SelectGrade: React.FC<SelectGrade> = ({value,onChange}) => {
  const [grades, setGrades] = useState<GradeYearInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchGrades = async () => {
    try {
      const res = await gradeAPI.getGradesAll();
      if (Array.isArray(res)) {
        setGrades(res);
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
        placeholder="เลือกชั้นปี"
        showSearch
        value={value}
        optionFilterProp="children"
        onChange={(value) => {
          console.log("เลือก:", value);
          onChange(value);
        }}
      >
        {grades.map((g) => (
          <Option key={g.id} value={`${g.grade_year}`}>
          ม. {g.grade_year}
          </Option>
        ))}
      </Select>
    </>
  );
};

export default SelectGrade;
