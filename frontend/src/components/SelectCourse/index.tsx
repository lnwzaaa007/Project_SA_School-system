import React, { useEffect, useMemo, useState } from "react";
import { Select, message } from "antd";
import type { SelectProps } from "antd";
import { courseAPI_N } from "../../services/https";
import type { CourseLite } from "../../interfaces/course";
import "./index.css";

const { Option } = Select;

type Props = {
  value: number | null;                    // เก็บเป็น course.id
  onChange: (courseId: number) => void;    // ส่งกลับเป็น course.id
  disabled?: boolean;
  placeholder?: string;
  // เผื่อไว้ ถ้าอยาก filter ตาม grade/term ภายหลัง (client-side)
  gradeId?: number;
  termId?: number;
  width?: number | string;
};

const SelectCourse: React.FC<Props> = ({
  value,
  onChange,
  disabled,
  placeholder = "เลือกวิชา",
  gradeId,
  termId,
  width = "100%",
}) => {
  const [courses, setCourses] = useState<CourseLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseAPI_N.getAll();
      // map เฉพาะฟิลด์ที่ต้องใช้
      const items: CourseLite[] = (res as any[]).map((r) => ({
        id: Number(r.id),
        course_code: r.course_code,
        course_name: r.course_name,
        grade_id: r.grade_id, // ถ้ามีนะ
      }));
      setCourses(items);
    } catch (err) {
      console.error("❌ โหลดรายวิชาล้มเหลว:", err);
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // filter ฝั่ง client ถ้ามี prop มากำกับ
  const filtered = useMemo(() => {
    let list = courses;
    if (gradeId) list = list.filter((c) => c.grade_id === gradeId);
    // ถ้าอยาก filter ตาม termId ต้องมีข้อมูล term ใน API หรือเพิ่มใน select list
    return list;
  }, [courses, gradeId, termId]);

  // ใช้ค้นหาจาก label (code และชื่อวิชา)
  const filterOption: SelectProps["filterOption"] = (input, option) => {
    const label = (option?.children ?? "").toString().toLowerCase();
    return label.includes(input.toLowerCase());
  };

  return (
    <>
      {contextHolder}
      <Select
        className="custom-select-course"
        style={{ width:220 }}
        showSearch
        allowClear
        placeholder={placeholder}
        disabled={disabled}
        loading={loading}
        value={value ?? undefined} // antd อยากได้ undefined แทน null
        optionFilterProp="children"
        filterOption={filterOption}
        onChange={(val) => onChange(Number(val))}
      >
        {filtered.map((c) => (
          <Option key={c.id} value={c.id}>
            {c.course_code} - {c.course_name}
          </Option>
        ))}
      </Select>
    </>
  );
};

export default SelectCourse;
