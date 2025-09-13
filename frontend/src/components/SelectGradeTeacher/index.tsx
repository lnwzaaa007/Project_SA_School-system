import { Select } from "antd";
import React, { useEffect, useState } from "react";
import { gradeCRUD } from "../../services/https";

type Props = {
  value?: number | null;
  onChange: (v: number | null) => void;
  disabled?: boolean;
};

const SelectGradeTeacher: React.FC<Props> = ({ value, onChange, disabled }) => {
  const [opts, setOpts] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      const res = await gradeCRUD.list(); // <-- ได้เป็น AxiosResponse
      const list = (res?.data?.data ?? res?.data ?? res ?? []) as any[];
      setOpts(
        list.map((g) => ({
          value: Number(g.id ?? g.ID), // สำคัญ! เป็น number
          label: `ม.${g.grade_year}/${g.grade_class}`,
        }))
      );
    })();
  }, []);

  return (
    <Select
      style={{ minWidth: 140 }}
      placeholder="เลือกชั้น"
      options={opts}
      value={value ?? undefined}                     // ใช้ undefined ไม่ใช่ null
      onChange={(v) =>
        onChange(typeof v === "number" ? v : null)   // ส่งกลับเป็น number|null
      }
      allowClear
      disabled={disabled}
    />
  );
};

export default SelectGradeTeacher;
