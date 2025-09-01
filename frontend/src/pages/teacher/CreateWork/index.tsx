import React, { useState } from "react";
import { Button, Modal, Input, Select, Card, Row, Col, DatePicker } from "antd";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { Moment } from "moment";
import moment from "moment";


const subjects = [
  { value: "thai", label: "ภาษาไทย" },
  { value: "math", label: "คณิตศาสตร์" },
  { value: "science", label: "วิทยาศาสตร์" },
  { value: "english", label: "ภาษาอังกฤษ" },
];

type Homework = {
  id: number;
  subject: string;
  title: string;
  description: string;
  openDate: string;
  closeDate: string;
};

const CreateWork: React.FC = () => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [openDate, setOpenDate] = useState<Moment | null>(null);
  const [closeDate, setCloseDate] = useState<Moment | null>(null);

  const navigate = useNavigate();

  const handleCreate = () => {
    setHomeworks([
      ...homeworks,
      {
        id: Date.now(),
        subject,
        title,
        description,
        openDate: openDate ? openDate.format("YYYY-MM-DD") : "",
        closeDate: closeDate ? closeDate.format("YYYY-MM-DD") : "",
      },
    ]);
    setModalOpen(false);
    setSubject("");
    setTitle("");
    setDescription("");
    setOpenDate(null);
    setCloseDate(null);
  };

  return (
    <div style={{ padding: 32 }}>
      <Button
        type="primary"
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 24 }}
      >
        สร้างงานใหม่
      </Button>

      <Modal
        title="สร้างงานใหม่"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        okText="สร้างงาน"
        cancelText="ยกเลิก"
      >
        <Select
          placeholder="เลือกวิชา"
          options={subjects}
          value={subject}
          onChange={setSubject}
          style={{ width: "100%", marginBottom: 16 }}
        />
        <Input
          placeholder="หัวข้อการบ้าน"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Input.TextArea
          placeholder="รายละเอียดการบ้าน"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ marginBottom: 16 }}
        />
        <DatePicker
          placeholder="วันที่เปิด"
          value={openDate}
          onChange={setOpenDate}
          style={{ width: "100%", marginBottom: 16 }}
        />
        <DatePicker
          placeholder="วันที่ปิด"
          value={closeDate}
          onChange={setCloseDate}
          style={{ width: "100%", marginBottom: 16 }}
        />
      </Modal>

      <Row gutter={[16, 16]}>
        {subjects.map((subj) => (
          <Col key={subj.value} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={subj.label}
              style={{ minHeight: 180 }}
            >
              {homeworks.filter((hw) => hw.subject === subj.value).length === 0 ? (
                <div style={{ color: "#aaa" }}>ยังไม่มีงานในวิชานี้</div>
              ) : (
                homeworks
                  .filter((hw) => hw.subject === subj.value)
                  .map((hw) => (
                    <div key={hw.id} style={{ marginBottom: 8 }}>
                      <strong>{hw.title}</strong>
                      <div>{hw.description}</div>
                      <div>
                        <span style={{ color: "#888" }}>
                          เปิด: {hw.openDate} | ปิด: {hw.closeDate}
                        </span>
                      </div>
                      <Link to="checkHomework">
                        <Button
                          type="primary"
                          style={{ marginTop: 8 }}
                        >
                          ตรวจงาน
                        </Button>
                      </Link>
                    </div>
                  ))
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CreateWork;
// filepath: d:\Project_SA_School-system\frontend\src\pages\teacher\CreateWork\index.tsx

