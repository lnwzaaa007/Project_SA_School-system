import React, { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { termAPI } from '../../services/https';
import type { TermInterface } from '../../interfaces/Term';
import './index.css';

const { Option } = Select;

interface SelectTerm {
  value: number | null;
  onChange: (value: number) => void;
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
        messageApi.error('ไม่พบข้อมูลเทอม');
      }
    } catch (err) {
      console.error('❌ โหลด term ผิดพลาด:', err);
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
        showSearch
        optionFilterProp="children"
        value={value}
        onChange={(value) => {
          console.log("เลือก:", value);
          onChange(value);
        }}
      >
        {term.map((t) => (
          <Option key={t.id} value={t.id}>
           ปีการศึกษา {t.academic_year} / {t.semester}
          </Option>
        ))}
      </Select>
    </>
  );                                                                                                                                                   
};

export default SelectTerm;
