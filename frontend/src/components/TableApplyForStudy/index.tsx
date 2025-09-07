// src/pages/admin/TableApplyForStudy.tsx
import React, { useEffect, useState } from "react";
import { Table, Button, message, Popconfirm, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { EnrollmentAPI } from "../../services/https";
import type { EnrollmentInterface } from "../../interfaces/Enrollment";

// แถวที่ใช้แสดงในตาราง (normalize แล้ว)
type Row = {
  id: number;
  firstName: string;
  lastName: string;
  gradeYear: number;
  gradeClass: number;
};

// รองรับคีย์หลายรูปแบบจาก backend
type RawEnrollment = EnrollmentInterface & Partial<{
  ID: number;
  TFirst_Name: string;
  TLast_Name: string;
  t_last_name: string;
  e_last_name: string;
  Grade_Year: number;
  Grade_Class: number;
}>;

// แปลงข้อมูลดิบ -> แถวที่ตารางใช้
const normalize = (e: RawEnrollment): Row => {
  const id = (e.id ?? e.ID) as number;
  const firstName = (e.t_first_name ?? e.TFirst_Name ?? e.e_first_name ?? "") as string;
  const lastName =
    (e.t_last_name ?? e.TLast_Name ?? (e as any).e_last_name ?? "") || "-";
  const gradeYear = Number(e.grade_year ?? e.Grade_Year ?? 0);
  const gradeClass = Number(e.grade_class ?? e.Grade_Class ?? 0);
  return { id, firstName, lastName, gradeYear, gradeClass };
};

const btnSquare: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const TableApplyForStudy: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = (await EnrollmentAPI.getEnrollment()) as RawEnrollment[];
      if (!Array.isArray(data)) {
        message.error("โหลดข้อมูลไม่สำเร็จ");
        setRows([]);
        return;
      }
      setRows(data.map(normalize).filter((r) => typeof r.id === "number"));
    } catch (err: any) {
      message.error(err?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // TODO: ผูก API จริงเมื่อมี endpoint
  const onApprove = (record: Row) => {
    message.success(`ยืนยันข้อมูล: ${record.firstName} ${record.lastName}`);
  };
  const onDelete = async (record: Row) => {
    message.info(`(ตัวอย่าง) ลบข้อมูล id=${record.id}`);
    // ลบเสร็จ -> load();
  };

  const columns: TableColumnsType<Row> = [
    { title:"ลำดับ",render: (_,_r, index) => index + 1, width: 50, fixed: "left"},
    { title: "ชื่อ", dataIndex: "firstName", width: 160, fixed: "left" },
    { title: "นามสกุล", dataIndex: "lastName", width: 160, fixed: "left" },
    { title: "ชั้นปี", dataIndex: "gradeYear", width: 100, align: "center" },
    { title: "ห้อง", dataIndex: "gradeClass", width: 100, align: "center" },
    {
      title: "ยืนยัน",
      width: 50,
      fixed: "right",
      align: "center",
      render: (_, r) => (
        <Tooltip title="ยืนยัน">
          <Button style={btnSquare} onClick={() => onApprove(r)} icon={<CheckOutlined />} />
        </Tooltip>
      ),
    },
    {
      title: "ลบ",
      width: 50,
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
      width: 50,
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
      dataSource={rows}
      rowKey={(r) => r.id}
      loading={loading}
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
};

export default TableApplyForStudy;
