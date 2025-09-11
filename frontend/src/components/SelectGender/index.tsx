import React, { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { GenderAPI } from '../../services/https';
import type { GenderInterface } from '../../interfaces/Gender';
import './index.css';

const { Option } = Select;

interface SelectGenderG {
  value: number | null;
  onChange: (value: number) => void;
}

const SelectGender: React.FC<SelectGenderG> = ({value, onChange }) => {
    const [GenderOptions, setGenderOptions] = useState<GenderInterface[]>([]);
      const [messageApi, contextHolder] = message.useMessage();

        const fetchGender = async () => {
                try {
                  const res = await GenderAPI.getGender();
                  console.log(" Gender Response:", res);
                  
                  if (Array.isArray(res)) {
                    setGenderOptions(res);
                  } else {
                    messageApi.error("เพศไม่สำเร็จ");
                  }
                } catch (err) {
                  console.error(err);
                  messageApi.error("เกิดข้อผิดพลาดในการโหลดเพศ");
                }
              };
            
              useEffect(() => {
                fetchGender();
              }, []);

              return (
                  <>
                    {contextHolder}
                  <Select
                    className="custom-select-gender"
                    placeholder="เพศ"
                    value={value}
                    onChange={(value) => {
                      console.log("เลือก:", value);
                      onChange(value);
                    }}
                  >
                  {GenderOptions.map((t) => (
                    <Option key={t.id} value={t.id}>
                      {t.gender_name}
                    </Option>
                  ))}
                </Select>
                  </>
                );
}
export default SelectGender;
