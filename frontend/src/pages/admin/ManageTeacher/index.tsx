// src/pages/admin/ManageTeacher.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Space, Button, Col, Row, Input, Modal, message, Select } from "antd";
import { PlusOutlined, DeleteOutlined, FormOutlined } from "@ant-design/icons";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { teacherAPI } from "../../../services/https";

const API_HOST = import.meta.env.VITE_API_KEY || "http://localhost:8088";
const toUrl = (p?: string) =>
  p ? (/^https?:\/\//i.test(p) ? p : `${API_HOST}/${p.replace(/^\/+/, "")}`) : "";

type TeacherLite = {
  id: number;
  teacher_id: string;
  t_first_name: string;
  t_last_name: string;
  qualification?: string;
  teacher_image?: string;
  status?: string
};


const { Search } = Input;

const ManageTeacher: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [teachers, setTeachers] = useState<TeacherLite[]>([]);
  const [query, setQuery] = useState("");

  // --- state สำหรับ Modal ลบ ---
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const selectedTeacher = useMemo(
    () => teachers.find((x) => x.id === deleteId) || null,
    [deleteId, teachers]
  );

  // โหลดรายชื่อครู
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await teacherAPI.getteacher(); // GET /teacher
        setLoading(false);

        if (Array.isArray(res)) {
          setTeachers(
            res.map((t: any) => ({
              // ✅ บังคับให้เป็น number กันกรณี backend ส่ง string แล้วเทียบ !== ไม่ออก
              id: Number(t.id ?? t.ID),
              teacher_id: t.teacher_id,
              t_first_name: t.t_first_name,
              t_last_name: t.t_last_name,
              qualification: t.qualification,
              teacher_image: t.teacher_image || t.Teacher_image,
              status: t.status || t.Status || undefined,
            }))
          );
        } else {
          message.error(res?.error || "โหลดรายชื่อครูไม่สำเร็จ");
        }
      } catch (e: any) {
        setLoading(false);
        message.error(e?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    };
    run();
  }, []);

  // ค้นหา (ชื่อ/รหัส/สาขา)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) => {
      const fullth = `${t.t_first_name} ${t.t_last_name}`.toLowerCase();
      return (
        fullth.includes(q) ||
        (t.teacher_id ?? "").toLowerCase().includes(q) ||
        (t.qualification ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, teachers]);

  const confirmEdit = (id: number) => {
    Modal.confirm({
      title: "คุณต้องการแก้ไขข้อมูลนี้หรือไม่?",
      okText: "ยืนยัน",
      cancelText: "ยกเลิก",
      centered: true,
      onOk: () => navigate(`EditTeacher?id=${id}`),
    });
  };

  // --- ยิงลบเมื่อกด OK ใน Modal ---
  const handleDeleteOk = async () => {
    if (deleteId == null) return;

    setDeleteLoading(true);
    try {
      // ✅ services.Delete จะคืน res.data เมื่อสำเร็จ และคืน error.response เมื่อผิดพลาด
      const res = await teacherAPI.deleteTeacher(deleteId);

      // ถ้าผิดพลาด จะได้ object ที่มี status กลับมา (AxiosResponse)
      if ((res && typeof (res as any).status === "number") || res?.error) {
        const msg =
          res?.data?.error ||
          res?.data?.message ||
          res?.error ||
          `ลบไม่สำเร็จ (status ${res?.status ?? "unknown"})`;
        throw new Error(msg);
      }

      // สำเร็จ -> เอาออกจาก state (id เป็น number ทั้งคู่แล้ว จะเทียบออกแน่นอน)
      setTeachers((prev) => prev.filter((x) => x.id !== deleteId));
      message.success("ลบข้อมูลสำเร็จ");
      setDeleteId(null);
    } catch (e: any) {
      console.error("DELETE teacher failed:", e);
      message.error(e?.message || "ลบไม่สำเร็จ");
    } finally {
      setDeleteLoading(false);
    }
  };

  // เพิ่มไว้ใน ManageTeacher.tsx



const statusOptions = [
  "ครูอัตราจ้าง", "ครูผู้ช่วย", "ครู คศ. 1", "ครู คศ. 2", "ครู คศ. 3", "ครู คศ. 4", "ครู คศ. 5"
].map(s => ({ value: s, label: s }));

// state สำหรับ modal ยืนยัน
const [confirmState, setConfirmState] = useState<{ id: number; next: string } | null>(null);
const [confirmLoading, setConfirmLoading] = useState(false);

const askChangeStatus = (id: number, next: string) => {
  setConfirmState({ id, next });   // เปิด modal
};

const doUpdateStatus = async () => {
  if (!confirmState) return;
  setConfirmLoading(true);
  try {
    const res = await teacherAPI.updateTeacher(confirmState.id, { status: confirmState.next });
    // services.Update: สำเร็จ -> res.data, ผิดพลาด -> error.response (มี .status)
    if ((res && typeof (res as any).status === "number") || res?.error) {
      const msg = res?.data?.error || res?.data?.message || res?.error || "อัปเดตไม่สำเร็จ";
      throw new Error(msg);
    }
    setTeachers(prev =>
      prev.map(t => t.id === confirmState.id ? { ...t, status: confirmState.next } : t)
    );
    message.success(`อัปเดตสถานะเป็น “${confirmState.next}” สำเร็จ`);
    setConfirmState(null);
  } catch (e: any) {
    message.error(e?.message || "อัปเดตไม่สำเร็จ");
  } finally {
    setConfirmLoading(false);
  }
};



  return (
    <div style={{ padding: 16, background: "#fff", minHeight: "calc(100vh - 40px)", width: "100%" }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Search
          placeholder="ค้นหาชื่อ/รหัสครู"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={setQuery}
          enterButton
          loading={loading}
          style={{ maxWidth: 360, marginTop: 12 }}
        />

        <Row justify="end" style={{ marginTop: 8 }}>
          <Link to="CreateTeacher">
            <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: "#0088ff" }}>
              เพิ่ม
            </Button>
          </Link>
        </Row>

        {/* กล่องรายชื่อครู */}
        <div style={{ marginTop: 12 }}>
          {filtered.length === 0 && !loading ? (
            <div style={{ textAlign: "center", padding: 32, color: "#888" }}>ไม่พบข้อมูลครู</div>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                style={{
                  background: "#E9F6FF",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* รูปครู */}
                      {t.teacher_image ? (
                        <img
                          src={toUrl(t.teacher_image)}
                          alt={t.t_first_name}
                          style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "#cfe9ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                          }}
                        >
                          {`${t.t_first_name?.[0] ?? ""}${t.t_last_name?.[0] ?? ""}`.trim()}
                        </div>
                      )}

                      <div>
                        <div style={{fontSize: 30, fontWeight: 600 }}>
                          {t.t_first_name} {t.t_last_name}
                        </div>
                        <div style={{ fontSize: 20, color: "#666" }}>
                          รหัสครู: {t.teacher_id} {t.qualification ? `· ${t.qualification}` : ""}
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col>
                    <Space>
                     {/* เลือกสถานะครู */}
                      <Select
                        style={{ width: 180 }}
                        placeholder="เลือกสถานะครู"
                        value={t.status || undefined}        // ยังแสดงค่าปัจจุบัน จนกว่าจะยืนยัน
                        options={statusOptions}
                        onChange={(val) => askChangeStatus(t.id, val)}   // แค่เปิด modal ยังไม่เปลี่ยนค่า
                      />


                      {/* ปุ่มลบ -> เปิด Modal */}
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => setDeleteId(t.id)}
                        style={{ background: "#ff1818ff" }}
                      >
                        ลบ
                      </Button>

                      <Link to={`EditTeacher?id=${t.id}`}>
                        <Button
                          type="primary"
                          icon={<FormOutlined />}
                          style={{ backgroundColor: "#ffca00", borderColor: "#ffca00" }}
                        >
                          แก้ไข
                        </Button>
                      </Link>
                    </Space>
                  </Col>
                </Row>
              </div>
            ))
          )}
        </div>
      </Space>

      {/* Modal ลบ */}
      <Modal
        title="ยืนยันการลบ"
        open={deleteId !== null}
        onOk={handleDeleteOk}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        onCancel={() => !deleteLoading && setDeleteId(null)}
        centered
        confirmLoading={deleteLoading}
      >
        <p>
          คุณต้องการลบข้อมูล
          {selectedTeacher
            ? ` ${selectedTeacher.t_first_name} ${selectedTeacher.t_last_name} (รหัสครู: ${selectedTeacher.teacher_id})`
            : ""} หรือไม่?
        </p>
      </Modal>

      <Modal
        title="ยืนยันการเปลี่ยนสถานะครู?"
        open={!!confirmState}
        centered
        okText="ตกลง"
        cancelText="ยกเลิก"
        onCancel={() => setConfirmState(null)}
        onOk={doUpdateStatus}
        confirmLoading={confirmLoading}
      >
        <p>
          ต้องการเปลี่ยนจาก “{
            teachers.find(x => x.id === confirmState?.id)?.status || "—"
          }” เป็น “{confirmState?.next}” ใช่หรือไม่
        </p>
      </Modal>


      <Outlet />
    </div>
  );
};

export default ManageTeacher;
