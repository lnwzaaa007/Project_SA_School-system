import React, { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { ProvinceAPI } from '../../services/https';
import type { ProvinceInterface } from '../../interfaces/Province';
import './index.css';

const { Option } = Select;

interface SelectProvinceP {
  value: number | null;
  onChange: (value: number) => void;
}

const SelectProvince: React.FC<SelectProvinceP> = ({value, onChange }) => {
    const [ProvinceOptions, setProvinceOptions] = useState<ProvinceInterface[]>([]);
      const [messageApi, contextHolder] = message.useMessage();

        const fetchProvince = async () => {
                try {
                  const res = await ProvinceAPI.getProvince();
                  console.log(" Province Response:", res);
                  
                  if (Array.isArray(res)) {
                    setProvinceOptions(res);
                  } else {
                    messageApi.error("จังหวัดโหลดไม่สำเร็จ");
                  }
                } catch (err) {
                  console.error(err);
                  messageApi.error("เกิดข้อผิดพลาดในการโหลด");
                }
              };
            
              useEffect(() => {
                fetchProvince();
              }, []);

              return (
                  <>
                    {contextHolder}
                  <Select
                    className="custom-select-province"
                    placeholder="จังหวัด"
                    value={value}
                    onChange={(value) => {
                      console.log("เลือก:", value);
                      onChange(value);
                    }}
                  >
                  {ProvinceOptions.map((t) => (
                    <Option key={t.id} value={t.id}>
                      {t.province_name}
                    </Option>
                  ))}
                </Select>
                  </>
                );
}
export default SelectProvince;
