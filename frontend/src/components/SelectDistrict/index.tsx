// components/SelectDistrict/index.tsx
import React, { useEffect, useState } from "react";
import { Select, message ,} from "antd";
import { AddressAPI } from "../../services/https";
import './index.css';

const {Option} =Select;
type Props = {
  provinceId: number | null;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

type District = { id: number; Pname_th: string; province_id: number };

const SelectDistrict: React.FC<Props> = ({ provinceId, value, onChange, disabled }) => {
  const [options, setOptions] = useState<District[]>([]);
  const [msg, ctx] = message.useMessage();

  useEffect(() => {
    if (!provinceId) { setOptions([]); onChange(null); return; }
    (async () => {
      try {
        const res = await AddressAPI.getDistrict(provinceId); // GET /provinces/:id/districts
        const data = Array.isArray(res) ? res : [];
        setOptions(data);
      } catch (e) {
        console.error(e);
        msg.error("อำเภอโหลดไม่สำเร็จ");
      }
    })();
  }, [provinceId]);

  return (
     <>
      {ctx}
      <Select
      className="custom-select-district"
        placeholder="อำเภอ/เขต"
        value={value ?? undefined}
        onChange={(v) => onChange(v)}
        allowClear
        disabled={disabled || !provinceId}
        options={options.map((d) => ({ value: d.id, label: d.Pname_th }))}
      />
    </>
  );
};

export default SelectDistrict;
