// src/pages/admin/CheckStatus.tsx
import React, { useState } from "react";
import { Card, Row, Col, Input, Button, Modal } from "antd";
import { EnrollmentAPI } from "../../../services/https";
import School from "../../../assets/School.jpg";

const CheckStatus: React.FC = () => {
  const [cid, setCid] = useState("");
  const [loading, setLoading] = useState(false);

  // ใช้ instance ของ modal ให้แสดงผลได้แน่นอน และรอการปิด (await)
  const [modal, contextHolder] = Modal.useModal();

  const normalizeCid = (v: string) => v.replace(/\D/g, "");
  const reset = () => setCid("");

  const handleCheck = async () => {
    const clean = normalizeCid(cid);

    if (clean.length !== 13) {
      await modal.warning({
        title: "เลขบัตรประชาชนไม่ถูกต้อง",
        content: "กรุณากรอกเลขบัตรประชาชน 13 หลัก",
        centered: true,
        okText: "ปิด",
      });
      reset();
      return;
    }

    setLoading(true);
    try {
      const res = await EnrollmentAPI.checkStatus(clean);

      // ถ้า Get() ผิดพลาดจะได้ object ที่มี field status เป็น number
      const isAxiosErr = res && typeof (res as any).status === "number" && !(res as any).data?.ok;
      if (!res || isAxiosErr || res?.error) {
        await modal.warning({
          title: "ไม่พบข้อมูลการสมัคร",
          content: "กรุณาตรวจสอบเลขบัตรประชาชนอีกครั้ง",
          centered: true,
          okText: "ปิด",
        });
        reset();
        return;
      }

      const payload = (res.data && typeof res.data === "object") ? res.data : res;

      const full_name =
        payload.full_name ??
        [payload.t_first_name, payload.t_last_name].filter(Boolean).join(" ") ??
        "-";

      const grade_year = payload.grade_year ?? payload.Grade_Year;
      const grade_class = payload.grade_class ?? payload.Grade_Class;

      const status_text =
        payload.status_text ??
        (payload.status === "completed"
          ? "ผ่านการคัดเลือก"
          : payload.status === "unsuccessful"
          ? "ไม่ผ่านการคัดเลือก"
          : payload.status === "cancel"
          ? "ยกเลิก"
          : payload.status || "รอพิจารณา");

      await modal.info({
        title: "ผลการตรวจสอบ",
        centered: true,
        okText: "ปิด",
        content: (
          <div style={{ lineHeight: 1.9 }}>
            <div><b>ชื่อผู้สมัคร:</b> {full_name || "-"}</div>
            <div><b>ชั้น/ห้อง:</b> {grade_year ? `${grade_year}/${grade_class ?? "-"}` : "-"}</div>
            <div><b>สถานะของคุณ:</b> {status_text}</div>
          </div>
        ),
      });
      reset(); // ล้างช่องหลังปิดผลลัพธ์ (เคสพบข้อมูล)
    } catch (e: any) {
      await modal.error({
        title: "เกิดข้อผิดพลาด",
        content: e?.message || "ตรวจสอบสถานะไม่สำเร็จ",
        centered: true,
        okText: "ปิด",
      });
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", padding: 20 }}>
      {contextHolder}

      <img
        src={School}
        alt="School Background"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.4,
        }}
      />

      <Card
        style={{
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: 24,
          background: "#fff",
          minHeight: "30vh",
          maxWidth: "35%",
          borderRadius: 32,
          margin: "18% auto 0",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <h1>ตรวจสอบสถานะ</h1>
        <Row justify="center">
          <Col span={24}>
            <label style={{ lineHeight: 2 }}>เลขบัตรประชาชน</label>
            <div>
              <Input
              placeholder="กรอกเลขบัตรประชาชน"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              maxLength={17}
              onPressEnter={handleCheck}
              style={{ textAlign: "center" ,width:"50%"}}
              allowClear
            />
            </div>
            
          </Col>
        </Row>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <Button type="primary" danger loading={loading} onClick={handleCheck}>
            ตรวจสอบสถานะ
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CheckStatus;
