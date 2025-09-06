import React, { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { TitleAPI } from '../../services/https';
import type { TitleInterface } from '../../interfaces/Title';
import './index.css';

const { Option } = Select;

interface SelectTitleENG {
  value: number | null;
  onChange: (value: number) => void;
}

const SelectTitleENG: React.FC<SelectTitleENG> = ({value, onChange }) => {
    const [GenderOptions, setGenderOptions] = useState<TitleInterface[]>([]);
      const [messageApi, contextHolder] = message.useMessage();

        const fetchGender = async () => {
                try {
                  const res = await TitleAPI.getTitle();
                  console.log(" Title Response:", res);
                  
                  if (Array.isArray(res)) {
                    setGenderOptions(res);
                  } else {
                    messageApi.error("คำนำหน้าอังกฤษไม่สำเร็จ");
                  }
                } catch (err) {
                  console.error(err);
                  messageApi.error("เกิดข้อผิดพลาดในการโหลดคำนำหน้าอังกฤษ");
                }
              };
            
              useEffect(() => {
                fetchGender();
              }, []);

              return (
                  <>
                    {contextHolder}
                  <Select
                    className="custom-select-titleeng"
                    placeholder="Title"
                    value={value}
                    onChange={(value) => {
                      console.log("เลือก:", value);
                      onChange(value);
                    }}
                  >
                  {GenderOptions.map((t) => (
                    <Option key={t.id} value={t.id}>
                      {t.title_eng}
                    </Option>
                  ))}
                </Select>
                  </>
                );
}
export default SelectTitleENG;
