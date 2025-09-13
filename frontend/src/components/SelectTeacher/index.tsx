import React, { useEffect, useState, useMemo } from "react";
import { Select, message } from "antd";
import type { SelectProps } from "antd";
import { teacherAPI_N } from "../../services/https";
import type { TeacherLite } from "../../interfaces/Teacher";
import "./index.css";

const { Option } = Select;

type Props = {
  value: number | null;                 // เก็บเป็น teacher.id
  onChange: (teacherId: number) => void;
  placeholder?: string;
  disabled?: boolean;
  width?: number | string;              // แนวทาง “ตั้งที่ root” แบบที่คุยกัน
};

const SelectTeacher: React.FC<Props> = ({
  value,
  onChange,
  placeholder = "เลือกครูผู้สอน",
  disabled,
  width = "100%",
}) => {
  const [items, setItems] = useState<TeacherLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const rows = await teacherAPI_N.getAll();
      setItems(rows);
    } catch (e) {
      console.error("❌ โหลดรายชื่อครูล้มเหลว:", e);
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูลครู");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // ให้ค้นหาได้จากรหัส/ชื่อ/นามสกุล
  const filterOption: SelectProps["filterOption"] = (input, option) => {
    const label = (option?.children ?? "").toString().toLowerCase();
    return label.includes(input.toLowerCase());
  };

  // เรียงตามรหัสครู (จะสลับเป็นชื่อก็ได้)
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.teacher_id.localeCompare(b.teacher_id, "th")),
    [items]
  );

  return (
    <>
      {contextHolder}
      <Select
        className="custom-select-teacher"
        style={{ width : 220 }}                 // ← root
        showSearch
        allowClear
        placeholder={placeholder}
        disabled={disabled}
        loading={loading}
        value={value ?? undefined}        // antd ชอบ undefined มากกว่า null
        optionFilterProp="children"
        filterOption={filterOption}
        onChange={(val) => onChange(Number(val))}
      >
        {sorted.map((t) => (
          <Option key={t.id} value={t.id}>
            {t.teacher_id} — {t.t_first_name} {t.t_last_name}
          </Option>
        ))}
      </Select>
    </>
  );
};

export default SelectTeacher;
