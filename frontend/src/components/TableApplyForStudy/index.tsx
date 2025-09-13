import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Table, Button, message, Popconfirm, Tooltip, Select } from "antd";
import type { TableColumnsType } from "antd";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { EnrollmentAPI } from "../../services/https";
import type { EnrollmentInterface } from "../../interfaces/Enrollment";

type Status = "completed" | "unsuccessful" | "waiting";
type Summary = { completed: number; waiting: number; unsuccessful: number };

type Props = {
  onSummaryChange?: (s: Summary) => void;
  filters?: { keyword?: string; grade?: number | null; status?: Status } | null;
};

type Row = {
  id: number;
  firstName: string;
  lastName: string;
  gradeYear: number;
  gradeClass: number;
};

type RawEnrollment = EnrollmentInterface & Partial<{
  ID: number;
  TFirst_Name: string;
  TLast_Name: string;
  t_last_name: string;
  e_last_name: string;
  Grade_Year: number;
  Grade_Class: number;
  status: string;    // <-- เผื่อ backend ส่งมา
  Status: string;    // <-- เผื่อกุญแจตัวใหญ่
}>;

const normalize = (e: RawEnrollment): Row => {
  const id = (e.id ?? e.ID) as number;
  const firstName = (e.t_first_name ?? e.TFirst_Name ?? e.e_first_name ?? "") as string;
  const lastName  = (e.t_last_name ?? e.TLast_Name ?? (e as any).e_last_name ?? "") || "-";
  const gradeYear = Number(e.grade_year ?? e.Grade_Year ?? 0);
  const gradeClass = Number(e.grade_class ?? e.Grade_Class ?? 0);
  return { id, firstName, lastName, gradeYear, gradeClass };
};

const toStatus = (v: any): Status => {
  const s = String(v ?? "").toLowerCase();
  if (s === "completed") return "completed";
  if (s === "unsuccessful") return "unsuccessful";
  return "waiting";
};

const btnSquare: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 8,
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};

const TableApplyForStudy: React.FC<Props> = ({ onSummaryChange, filters }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<number, Status>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({}); // กำลังบันทึกต่อแถว

  const computeAndEmit = useCallback((map: Record<number, Status>) => {
    const summary: Summary = { completed: 0, waiting: 0, unsuccessful: 0 };
    Object.values(map).forEach((s) => {
      if (s === "completed") summary.completed += 1;
      else if (s === "unsuccessful") summary.unsuccessful += 1;
      else summary.waiting += 1;
    });
    onSummaryChange?.(summary);
  }, [onSummaryChange]);

  const load = async () => {
    try {
      setLoading(true);
      const data = (await EnrollmentAPI.getEnrollment()) as RawEnrollment[];
      if (!Array.isArray(data)) {
        message.error("โหลดข้อมูลไม่สำเร็จ");
        setRows([]); setStatusMap({}); computeAndEmit({});
        return;
      }

      const newRows = data.map(normalize).filter((r) => typeof r.id === "number");
      setRows(newRows);

      // ✅ ดึงสถานะจาก backend ถ้ามี ไม่มีก็ตั้ง waiting
      const init: Record<number, Status> = {};
      data.forEach((e) => {
        const id = (e.id ?? e.ID) as number | undefined;
        if (!id) return;
        init[id] = toStatus((e as any).status ?? (e as any).Status);
      });
      setStatusMap(init);
      computeAndEmit(init);
    } catch (err: any) {
      message.error(err?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setRows([]); setStatusMap({}); computeAndEmit({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // ⭐ กรองข้อมูลตาม filters
  const filteredRows = useMemo(() => {
    let list = rows;
    if (filters?.keyword) {
      const kw = filters.keyword.toLowerCase();
      list = list.filter((r) => `${r.firstName} ${r.lastName}`.toLowerCase().includes(kw));
    }
    if (filters?.grade) list = list.filter((r) => r.gradeYear === Number(filters.grade));
    if (filters?.status) list = list.filter((r) => (statusMap[r.id] ?? "waiting") === filters.status);
    return list;
  }, [rows, statusMap, filters]);

  // ✅ กดเครื่องหมายถูกเพื่อบันทึกสถานะลง backend
  const onApprove = async (record: Row) => {
    const newStatus = statusMap[record.id] ?? "waiting";
    const label = newStatus === "completed" ? "ผ่านการคัดเลือก"
                : newStatus === "unsuccessful" ? "ไม่ผ่านการคัดเลือก"
                : "รอพิจารณา";

    try {
      setSaving((s) => ({ ...s, [record.id]: true }));
      const res = await EnrollmentAPI.updateEnrollment(record.id, { status: newStatus });
      if (res?.error) throw new Error(res.error);
      message.success(`บันทึกสถานะเป็น “${label}” แล้ว`);
      // ถ้าต้องการให้รีโหลดจากฐานข้อมูลจริง ๆ: await load();
    } catch (e: any) {
      message.error(e?.message || "อัปเดตไม่สำเร็จ");
    } finally {
      setSaving((s) => {
        const { [record.id]: _, ...rest } = s; return rest;
      });
    }
  };

  const onDelete = async (record: Row) => {
    try {
      const res = await EnrollmentAPI.deleteEnrollment(record.id);
      if (res && typeof res.status === "number") {
        message.error(res?.data?.error || "ลบไม่สำเร็จ");
        return;
      }
      message.success(res?.message || `ลบข้อมูล ID ${record.id} สำเร็จ`);
      setRows((prev) => prev.filter((r) => r.id !== record.id));
      setStatusMap((prev) => {
        const next = { ...prev }; delete next[record.id]; computeAndEmit(next); return next;
      });
    } catch (e: any) {
      message.error(e?.message || "ลบไม่สำเร็จ");
    }
  };

  const columns: TableColumnsType<Row> = [
    { title: "ลำดับ", render: (_,_r, index) => index + 1, width: 60, fixed: "left" },
    { title: "ชื่อ", dataIndex: "firstName", width: 160, fixed: "left" },
    { title: "นามสกุล", dataIndex: "lastName", width: 160, fixed: "left" },
    { title: "ชั้นปี", dataIndex: "gradeYear", width: 100, align: "center" },
    { title: "ห้อง", dataIndex: "gradeClass", width: 100, align: "center" },

    {
      title: "สถานะ",
      width: 220,
      align: "center",
      render: (_, r) => (
        <Select<Status>
          value={statusMap[r.id] ?? "waiting"}
          style={{ width: 200 }}
          onChange={(val) => {
            setStatusMap((prev) => {
              const next = { ...prev, [r.id]: val };
              computeAndEmit(next);
              return next;
            });
          }}
          options={[
            { value: "completed", label: "ผ่านการคัดเลือก" },
            { value: "unsuccessful", label: "ไม่ผ่านการคัดเลือก" },
            { value: "waiting", label: "รอพิจารณา" },
          ]}
        />
      ),
    },

    {
      title: "ยืนยัน",
      width: 60,
      fixed: "right",
      align: "center",
      render: (_, r) => (
        <Popconfirm
          title="ยืนยันการเปลี่ยนสถานะ?"
          description="ต้องการบันทึกสถานะสำหรับผู้สมัครรายนี้หรือไม่"
          okText="ยืนยัน"
          cancelText="ยกเลิก"
          onConfirm={() => onApprove(r)}
        >
          <Tooltip title="ยืนยัน">
            <Button
              style={btnSquare}
              loading={!!saving[r.id]}
              icon={<CheckOutlined />}
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
    {
      title: "ลบ",
      width: 60,
      fixed: "right",
      align: "center",
      render: (_, r) => (
        <Popconfirm
          title="ต้องการลบรายการนี้หรือไม่?"
          okText="ลบ"
          cancelText="ยกเลิก"
          onConfirm={() => onDelete(r)}
        >
          <Tooltip title="ลบ">
            <Button style={btnSquare} danger icon={<CloseOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
    {
      title: "แสดง",
      width: 60,
      fixed: "right",
      align: "center",
      render: (_, r) => (
        <Tooltip title="ดูรายละเอียด">
          <Link to={`/admin/applyForStudy/MoveAddStudent?id=${r.id}`}>
            <Button style={btnSquare} icon={<EyeOutlined />} />
          </Link>
        </Tooltip>
      ),
    },
  ];

  return (
    <Table<Row>
      bordered
      size="middle"
      className="custom-scroll-table"
      columns={columns}
      dataSource={filteredRows}
      rowKey={(r) => r.id}
      loading={loading}
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
};

export default TableApplyForStudy;
