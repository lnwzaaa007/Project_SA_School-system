import React, { useState } from "react";
import SelectGrade from "../../../components/SelectGrade";
import SelectClass from "../../../components/SelectClass";
import SelectCourse from "../../../components/SelectCourse";
import { Button, Card, Checkbox, Typography,Input } from "antd";
import { SearchOutlined  } from "@ant-design/icons";

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

  const summary = students.reduce(
    (acc, s) => {
      if (s.present) acc.present++;
      if (s.leave) acc.leave++;
      if (s.absent) acc.absent++;
      return acc;
    },
    { present: 0, leave: 0, absent: 0 }
  );

  const handleRemarkChange = (id: number, remark: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, remark } : student
      )
    );
  };

  const handleReset = () => {
  setStudents((prev) =>
    prev.map((student) => ({
      ...student,
      present: false,
      leave: false,
      absent: false,
      remark: "",
    }))
  );
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F1EEE0",
        display: "flex",
        justifyContent: "center",
        // padding: 40,
      }}
    >
      <Card style={{ width: "100%" }} bodyStyle={{ padding: "24px" }}>
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
          <div style={{
            justifyContent:"end", 
            display: "flex",
            width:"100px",
            height:"40px",
            // background:"#000"
            }}
            >
            <Button 
            style={{width:"100%",height:"100%"}}
            type="primary"
            icon={<SearchOutlined />}>
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <div style={{ marginTop: 32, fontSize:"16px" }}>
           <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#E6F4FF", textAlign: "center" }}>
                <th style={{ padding: "8px", textAlign: "left" }}>ชื่อ-นามสกุล</th>
                <th style={{ padding: "4px", width: "40px" }}>มา</th>
                <th style={{ padding: "4px", width: "40px" }}>ลา</th>
                <th style={{ padding: "4px", width: "40px" }}>ขาด</th>
                <th style={{ padding: "4px", minWidth: "200px" }}>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} style={{ textAlign: "center" }}>
                  <td style={{ padding: "8px", textAlign: "left" }}>{student.name}</td>
                  <td style={{ padding: "4px" }}>
                    <Checkbox
                      checked={student.present}
                      onChange={() => handleStatusChange(student.id, "present")}
                      style={{
                        backgroundColor: student.present ? "#B7E4C7" : undefined,
                        padding: "4px",
                        borderRadius: 4,
                      }}
                    />
                  </td>
                  <td style={{ padding: "4px" }}>
                    <Checkbox
                      checked={student.leave}
                      onChange={() => handleStatusChange(student.id, "leave")}
                      style={{
                        backgroundColor: student.leave ? "#FFE066" : undefined,
                        padding: "4px",
                        borderRadius: 4,
                      }}
                    />
                  </td>
                  <td style={{ padding: "4px" }}>
                    <Checkbox
                      checked={student.absent}
                      onChange={() => handleStatusChange(student.id, "absent")}
                      style={{
                        backgroundColor: student.absent ? "#FF6B6B" : undefined,
                        padding: "4px",
                        borderRadius: 4,
                      }}
                    />
                  </td>
                  <td style={{ padding: "4px",width:"800px" }}>
                    <Input
                      value={student.remark}
                      onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                      placeholder="ระบุเหตุผล"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div
            style={{
              background: "#D7EDFF",
              marginTop: 24,
              padding: "12px 24px",
              borderRadius: 8,
              fontWeight: "bold",
              fontSize:"16px"
            }}
          >
            รวม มา {summary.present} ขาด {summary.absent} ลา {summary.leave}
          </div>

          {/* Confirm Button */}
          <div style={{ display: "flex", 
            justifyContent: "flex-end", 
            marginTop: 20, 
            width:"100%",
            height:"40px",
            gap: 12
            }}
            >
            <Button type="primary" 
              style={{width:"100px",height:"100%"}}>
                บันทึก 
            </Button>
            <Button 
              style={{width:"100px",height:"100%"}}
              onClick={handleReset}>
                รีเซ็ต
              </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceRecord;
