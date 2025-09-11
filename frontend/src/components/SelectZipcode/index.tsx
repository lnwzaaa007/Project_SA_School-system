// components/SelectDistrict/index.tsx
import React, { useEffect, useState } from "react";
import { Select, message } from "antd";
import { AddressAPI } from "../../services/https";
import './index.css';

const {Option} =Select;


type zipcode = {
  subdistrictId: number | null;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

type Zipcode = { id: number; 
    thai_zip_code: number;
    thai_district_id: number;
    thai_subdistrict_name: string; };

const SelectZipcode: React.FC<zipcode> = ({ subdistrictId, value, onChange, disabled }) => {
  const [options, setOptions] = useState<Zipcode[]>([]);
  const [msg, ctx] = message.useMessage();

  useEffect(() => {
    if (!subdistrictId) { setOptions([]); onChange(null); return; }
    (async () => {
      try {
        const res = await AddressAPI.getZipcode(subdistrictId); // GET /provinces/:id/districts
        const data = Array.isArray(res) ? res : [];
        setOptions(data);
      } catch (e) {
        console.error(e);
        msg.error("รหัสไปรษณีย์โหลดไม่สำเร็จ");
      }
    })();
  }, [subdistrictId]);

  return (
   <>
      {ctx}
      <Select
      className="custom-select-zipcode"
        placeholder="รหัสไปรษณีย์"
        value={value ?? undefined}
        onChange={(v) => {
          console.log("เลือก:", v); // แสดงเฉพาะ id
          onChange(v);
        }}
        allowClear
        disabled={disabled || !subdistrictId}
        options={options.map((d) => ({ value: d.id, label: d.thai_zip_code }))}
      />
    </>
  );
};

export default SelectZipcode;
