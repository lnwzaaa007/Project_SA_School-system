import React, { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { classAPI } from '../../services/https';
import type { GradeClassInterface } from '../../interfaces/Grade';
import './index.css';

const { Option } = Select;

const SelectClass: React.FC = () => {
  const [class_, setClass_] = useState<GradeClassInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchGrades = async () => {
    try {
      const res = await classAPI.getClassesAll();
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
        optionFilterProp="children"
        onChange={(value) => console.log('เลือก:', value)}
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
     
