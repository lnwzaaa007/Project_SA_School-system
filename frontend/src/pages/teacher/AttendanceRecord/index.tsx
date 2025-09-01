import React, { useState, useEffect } from "react"; 
import SelectGrade from "../../../components/SelectGrade";
import SelectClass from "../../../components/SelectClass";
import SelectCourse from "../../../components/SelectCourse";
import { Button, Card, Checkbox, Typography, Input, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import './index.css';

const { Text } = Typography;

type Student = {
  id: number;
  name: string;
  present: boolean;
  leave: boolean;
  absent: boolean;
  remark: string;
};

const initialStudents: Student[] = [
  { id: 1, name: "นักเรียน ก", present: true, leave: false, absent: false, remark: "" },
  { id: 2, name: "นักเรียน ข", present: false, leave: true, absent: false, remark: "" },
  { id: 3, name: "นักเรียน ค", present: false, leave: false, absent: true, remark: "" },
  { id: 4, name: "นักเรียน ง", present: true, leave: false, absent: false, remark: "" },
  { id: 5, name: "นักเรียน จ", present: true, leave: false, absent: false, remark: "" },
];

const AttendanceRecord: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(initialStudents);

  useEffect(() => {
    handleReset(); // ✅ เรียก reset ตอนเปิด component ครั้งแรก
  }, []);

  const handleStatusChange = (id: number, status: "present" | "leave" | "absent") => {
    setStudents(prev =>
      prev.map(student =>
        student.id === id
          ? {
              ...student,
              present: status === "present",
              leave: status === "leave",
              absent: status === "absent",
            }
          : student
      )
    );
  };

  const handleRemarkChange = (id: number, remark: string) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === id ? { ...student, remark } : student
      )
    );
  };

  const handleReset = () => {
    setStudents(prev =>
      prev.map(student => ({
        ...student,
        present: false,
        leave: false,
        absent: false,
        remark: "",
      }))
    );
  };

  const summary = students.reduce(
    (acc, s) => {
      if (s.present) acc.present++;
      if (s.leave) acc.leave++;
      if (s.absent) acc.absent++;
      return acc;
    },
    { present: 0, leave: 0, absent: 0 }
  );

  const columns = [
    {
      title: "ลำดับ",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      align: "center" as const,
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "name",
      key: "name",
      
    },
    {
      title: "มา",
      key: "present",
      align: "center" as const,
      width: 60,
      render: (_: any, record: Student) => (
        <Checkbox
          checked={record.present}
          onChange={() => handleStatusChange(record.id, "present")}
          style={{
            backgroundColor: record.present ? "#B7E4C7" : undefined,
            padding: 4,
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: "ลา",
      key: "leave",
      align: "center" as const,
      width: 60,
      render: (_: any, record: Student) => (
        <Checkbox
          checked={record.leave}
          onChange={() => handleStatusChange(record.id, "leave")}
          style={{
            backgroundColor: record.leave ? "#FFE066" : undefined,
            padding: 4,
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: "ขาด",
      key: "absent",
      align: "center" as const,
      width: 60,
      render: (_: any, record: Student) => (
        <Checkbox
          checked={record.absent}
          onChange={() => handleStatusChange(record.id, "absent")}
          style={{
            backgroundColor: record.absent ? "#FF6B6B" : undefined,
            padding: 4,
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: "หมายเหตุ",
      dataIndex: "remark",
      key: "remark",
      width: 600,
      align: "center" as const,
      render: (_: any, record: Student) => (
        <Input
          // style={{width:"600px"}}
          placeholder="ระบุเหตุผล"
          value={record.remark}
          onChange={(e) => handleRemarkChange(record.id, e.target.value)}
        />
      ),
    },
  ];

  return (
    <div
    className="attendance-font"
      style={{
        minHeight: "100vh",
        // background: "#F1EEE0",
        display: "flex",
        justifyContent: "center",
        

      }}
    >
      <Card 
      style={{ width: "100%", border: "none", boxShadow: "none" }} 
      bodyStyle={{ padding: "24px" }}>
        {/* Filter Section */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "5px",
            alignItems: "center",
          }}
        >
          <SelectGrade />
          <SelectClass />
          <SelectCourse />
          <div
            style={{
              justifyContent: "end",
              display: "flex",
              width: "50px",
              height: "40px",
            }}
          >
          </div>
        </div>

        {/* Table Section */}
        <div style={{ marginTop: 32, }}>
          <Table
            columns={columns}
            dataSource={students}
            rowKey="id"
            pagination={false}
            bordered
          />

          {/* Summary */}
          <div
            style={{
              // background: "#D7EDFF",
              marginTop: 24,
              padding: "16px 24px",
              borderRadius: 12,
              fontWeight: "bold",
              fontSize: "16px",
              justifyContent:"life"
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
              <div
                style={{
                  backgroundColor: "#B7E4C7", // เขียว - มา
                  padding: "12px 24px",
                  borderRadius: 8,
                  minWidth: 100,
                  textAlign: "center",
                }}
              >
                มา {summary.present}
              </div>
              <div
                style={{
                  backgroundColor: "#FFE066", // เหลือง - ลา
                  padding: "12px 24px",
                  borderRadius: 8,
                  minWidth: 100,
                  textAlign: "center",
                }}
              >
                ลา {summary.leave}
              </div>
                <div
                  style={{
                    backgroundColor: "#FF6B6B", // แดง - ขาด
                    padding: "12px 24px",
                    borderRadius: 8,
                    minWidth: 100,
                    textAlign: "center",
                    color: "#fff",
                  }}
                >
                  ขาด {summary.absent}
              </div>
              </div>
            </div>


          {/* Confirm & Reset Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 20,
              width: "100%",
              height: "40px",
              gap: 12,
            }}
          >
            <Button type="primary" style={{ width: "100px", height: "100%" }}>
              บันทึก
            </Button>
            <Button style={{ width: "100px", height: "100%" }} onClick={handleReset}>
              รีเซ็ต
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceRecord;
