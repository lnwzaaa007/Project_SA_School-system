// components/SelectDistrict/index.tsx
import React, { useEffect, useState } from "react";
import { Select, message } from "antd";
import { AddressAPI } from "../../services/https";
import './index.css';

const {Option} =Select;

type subdistrict = {
  districtId: number | null;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

type Subdisistrict = { id: number; zip_code: number; amphure_id: number; Sname_th: string; };

const SelectSubdistrict: React.FC<subdistrict> = ({ districtId, value, onChange, disabled }) => {
  const [options, setOptions] = useState<Subdisistrict[]>([]);
  const [msg, ctx] = message.useMessage();

  useEffect(() => {
    if (!districtId) { setOptions([]); onChange(null); return; }
    (async () => {
      try {
        const res = await AddressAPI.getSubdistrict(districtId); // GET /provinces/:id/districts
        const data = Array.isArray(res) ? res : [];
        setOptions(data);
      } catch (e) {
        console.error(e);
        msg.error("ตำบลโหลดไม่สำเร็จ");
      }
    })();
  }, [districtId]);

  return (
    <>
      {ctx}
      <Select
      className="custom-select-subdistrict"
        placeholder="ตำบล/แขวง"
        value={value ?? undefined}
        onChange={(v) => {
          console.log("เลือก:", v); // แสดงเฉพาะ id
          onChange(v);
        }}
        allowClear
        disabled={disabled || !districtId}
        options={options.map((d) => ({ value: d.id, label: d.Sname_th }))}
      />
    </>
  );
};

export default SelectSubdistrict;
