// src/pages/admin/ApplyForStudy.tsx
import React, { useState } from "react";
import { Col, Row, Input, Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import SelectGrade from "../../../components/SelectGrade";
import TableApplyForStudy from "../../../components/TableApplyForStudy";

const { Option } = Select;

// ให้ตรงกับค่าที่คอลัมน์สถานะใช้
type Status = "completed" | "unsuccessful" | "waiting";


const ApplyForStudy = () => {
  // ฟอร์มค้นหา (ยังไม่ใช่ตัวกรองที่ตาราง)
  const [keyword, setKeyword] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [status, setStatus] = useState<Status | undefined>(undefined);

  // ตัวเลขสรุปที่หัว
  const [summary, setSummary] = useState({
    completed: 0,
    waiting: 0,
    unsuccessful: 0,
  });

  // ตัวกรองที่ “กดค้นหาแล้วค่อยนำไปใช้”
  const [filters, setFilters] = useState<{
    keyword?: string;
    grade?: number | null;
    status?: Status;
  } | null>(null);

  const onSearch = () => {
    setFilters({
      keyword: keyword.trim(),
      grade: selectedGrade ?? undefined,
      status: status ?? undefined,
    });
  };

  const onClear = () => {
    setKeyword("");
    setSelectedGrade(null);
    setStatus(undefined);
    setFilters(null); // กลับมาแสดงทั้งหมด
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#fff", minHeight: "100vh" }}>
      <Row gutter={[16, 12]}>
        <Col xs={24} md={8}>
          <div style={{ backgroundColor: "#c0ffc0", padding: 20, borderRadius: 8 }}>
            <h3>Completed {summary.completed}</h3>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div style={{ backgroundColor: "#D4EDFF", padding: 20, borderRadius: 8 }}>
            <h3>Waiting {summary.waiting}</h3>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div style={{ backgroundColor: "#FFE0E0", padding: 20, borderRadius: 8 }}>
            <h3>Unsuccessful {summary.unsuccessful}</h3>
          </div>
        </Col>
      </Row>

      {/* แถบค้นหา */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 20,
          padding: 16,
          background: "#F1F1F1",
          width: "70%",
          borderRadius: 16,
          marginLeft: "15%",
        }}
      >
        <div>
          <Row gutter={[24, 12]} style={{ marginTop: 5, marginBottom: 5 }}>
            <Col xs={24} md={6}>
              <label>ชื่อผู้สมัคร</label>
              <Input
                style={{ width: "100%", height: 45 }}
                placeholder="ค้นหาชื่อผู้สมัคร"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Col>

            <Col xs={24} md={6}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label>ระดับชั้น</label>
                <SelectGrade value={selectedGrade} onChange={setSelectedGrade} />
              </div>
            </Col>

            <Col xs={24} md={6}>
              <label>สถานะ</label>
              <Select
                allowClear
                placeholder="เลือก"
                style={{ width: "100%", height: 45 }}
                value={status}
                onChange={(v) => setStatus(v as Status)}
              >
                <Option value="waiting">รอพิจารณา</Option>
                <Option value="completed">ผ่านการคัดเลือก</Option>
                <Option value="unsuccessful">ไม่ผ่านการคัดเลือก</Option>
              </Select>
            </Col>

            <Col xs={24} md={6} style={{ display: "flex", gap: 8, alignItems: "end" }}>
              <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
                ค้นหา
              </Button>
              <Button onClick={onClear}>ล้าง</Button>
            </Col>
          </Row>
        </div>
      </div>

      {/* ตาราง + ส่งตัวกรอง & callback ยอดรวม */}
      <div style={{ marginTop: 20, padding: 16, background: "#F1F1F1" }}>
        <TableApplyForStudy filters={filters} onSummaryChange={setSummary} />
      </div>
    </div>
  );
};

export default ApplyForStudy;
