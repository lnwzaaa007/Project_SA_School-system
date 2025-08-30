import React, { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { termAPI } from '../../services/https';
import type { TermInterface } from '../../interfaces/Term';
import './index.css';

const { Option } = Select;

interface SelectTerm {
  value: string | null;
  onChange: (value: string) => void;
}

const SelectTerm: React.FC<SelectTerm> = ({value,onChange}) => {
  const [term, setTerm] = useState<TermInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchTerm = async () => {
    try {
      const res = await termAPI.getTermsAll();
      if (Array.isArray(res)) {
        setTerm(res);
      } else {
        messageApi.error('ไม่พบข้อมูลชั้นปี');
      }
    } catch (err) {
      console.error('❌ โหลด grade ผิดพลาด:', err);
      messageApi.error('เกิดข้อผิดพลาด');
    }
  };

  useEffect(() => {
    fetchTerm();
  }, []);

  return (
    <>
      {contextHolder}
      <Select
        className="custom-select-term"
        placeholder="เลือกปีการศึกษา"
        style={{ width: 300 }}
        showSearch
        optionFilterProp="children"
        value={value}
        onChange={(value) => {
          console.log("เลือก:", value);
          onChange(value);
        }}
      >
        {term.map((t) => (
          <Option key={t.ID} value={`${t.academic_year} ${t.semester}`}>
           ปีการศึกษา {t.academic_year} / {t.semester}
          </Option>
        ))}
      </Select>
    </>
  );
};

export default SelectTerm;
