import React, { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { TitleAPI } from '../../services/https';
import type { TitleInterface } from '../../interfaces/Title';
import './index.css';

const { Option } = Select;

interface SelectTitleTH {
  value: number | null;
  onChange: (value: number) => void;
}

const SelectTitleTH: React.FC<SelectTitleTH> = ({value, onChange }) => {
    const [GenderOptions, setGenderOptions] = useState<TitleInterface[]>([]);
      const [messageApi, contextHolder] = message.useMessage();

        const fetchGender = async () => {
                try {
                  const res = await TitleAPI.getTitle();
                  console.log(" Title Response:", res);
                  
                  if (Array.isArray(res)) {
                    setGenderOptions(res);
                  } else {
                    messageApi.error("คำนำหน้าไทยไม่สำเร็จ");
                  }
                } catch (err) {
                  console.error(err);
                  messageApi.error("เกิดข้อผิดพลาดในการโหลดคำนำหน้าไทย");
                }
              };
            
              useEffect(() => {
                fetchGender();
              }, []);

              return (
                  <>
                    {contextHolder}
                  <Select
                    className="custom-select-titleth"
                    placeholder="คำนำหน้า"
                    value={value}
                    onChange={(value) => {
                      console.log("เลือก:", value);
                      onChange(value);
                    }}
                  >
                  {GenderOptions.map((t) => (
                    <Option key={t.id} value={t.id}>
                      {t.title_th}
                    </Option>
                  ))}
                </Select>
                  </>
                );
}
export default SelectTitleTH;
