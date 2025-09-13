import React, { useEffect, useMemo, useState } from "react";
import { Modal, List, Checkbox, Spin, Typography, Button, message, Space, Divider } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import type { Course } from "../types";
import { ScheduleAPI } from "../../../../services/https";
import type { ScheduleInterface } from "../../../../interfaces/Schedule";

const { Text } = Typography;

interface DeleteCoursesModalProps {
  open: boolean;
  onCancel: () => void;
  onDelete: (selectedCourses: Course[]) => void; // ส่งกลับให้ parent
  termId: number;
  gradeYear: number;
  gradeClass: number;
  fetchSchedule: () => void;
}

const DeleteCoursesModal: React.FC<DeleteCoursesModalProps> = ({
  open,
  onCancel,
  onDelete,
  termId,
  gradeYear,
  gradeClass,
  fetchSchedule,
}) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ScheduleInterface[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  

  // helper: ฟอร์แมตเวลา (รองรับ start_time / start_tinme)
  const fmtTime = (it: ScheduleInterface) => {
    const start = (it as any).start_time ?? "";
    const end = it.end_time ?? "";
    return start && end ? `${start}–${end}` : start || end || "-";
  };

  // reset เมื่อปิด modal
  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      setRows([]);
    }
  }, [open]);

  // ดึงข้อมูลเมื่อเปิด/พารามิเตอร์เปลี่ยน
  const fetchScheduleDelete = async () => {
    if (!open) return;
      if (!gradeYear || !gradeClass || !termId) {
        setRows([]);
        return;
      }

      try {
        setLoading(true);
        const res = await ScheduleAPI.getSchedule(gradeYear, gradeClass, termId);
        
        // API ของคุณส่ง { data: [...] }
        const raw =
          (Array.isArray(res?.data?.data) && res.data.data) ||
          (Array.isArray(res?.data) && res.data) ||
          [];

          // map ให้มี field id (จาก id หรือ id_schedule ของ backend)
          const list: ScheduleInterface[] = (Array.isArray(raw) ? raw : [])
            .map((r: any) => ({
              ...r,
              id: typeof r.id === "number" ? r.id : r.id_schedule,
            })) as ScheduleInterface[];
          
          // เรียงเพื่อให้อ่านง่าย
          list.sort((a, b) => {
            const dayA = a.day ?? "";
            const dayB = b.day ?? "";
            if (dayA !== dayB) return dayA.localeCompare(dayB, "th");
            const tA = ((a as any).start_time ?? "") as string;
            const tB = ((b as any).start_time ?? "") as string;
            if (tA !== tB) return tA.localeCompare(tB);
            return (a.course_code ?? "").localeCompare(b.course_code ?? "");
          });

        setRows(list);
        setSelectedIds([]); // รีเซ็ตการเลือกทุกครั้งที่โหลดใหม่
      } catch (err: any) {
        console.error("❌ โหลดตารางผิดพลาด:", err);
        messageApi.error(err?.response?.data?.error || "เกิดข้อผิดพลาดในการโหลดตาราง");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    
    useEffect(() => {
      fetchScheduleDelete();
    }, [open, gradeYear, gradeClass, termId]);

    
    // ลบหลายคาบที่เลือก
    const [deleting, setDeleting] = useState(false);
    const deleteSelected = async () => {
      if (selectedIds.length === 0) {
        message.warning("กรุณาเลือกคาบที่ต้องการลบ");
        return;
      }
      try {
        setDeleting(true);
        // ถ้ามี bulk API:
        // await ScheduleAPI.deleteSchedules(selectedIds);
        // ถ้ายังไม่มี bulk API ให้วนทีละ id ก็ได้ (ช้ากว่า):
        await Promise.all(selectedIds.map(id => ScheduleAPI.deleteSchedule(id)));

        setRows(prev => prev.filter(r => !r.id || !selectedIds.includes(r.id)));
        setSelectedIds([]);
        message.success(`ลบ ${selectedIds.length} คาบสำเร็จ`);
        fetchSchedule(); //ลบวิชาแล้วรีข้อมูลทันที

      } catch (err: any) {
        message.error(err?.response?.data?.error || err.message || "ลบไม่สำเร็จ");
      } finally {
        setDeleting(false);
      }
    };


  // toggle เลือกคาบด้วย id
  const toggleById = (id?: number) => {
    if (typeof id !== "number") return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // เลือกทั้งหมด/ยกเลิกทั้งหมด
  const allIds = useMemo(() => rows.map(r => r.id!).filter((x): x is number => typeof x === "number"), [rows]);
  const allChecked = allIds.length > 0 && selectedIds.length === allIds.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;
  const toggleAll = (checked: boolean) => setSelectedIds(checked ? allIds : []);

  // ส่งกลับให้ parent: แปลงคาบที่เลือก → รายวิชาไม่ซ้ำ
  const handleDelete = () => {
    if (selectedIds.length === 0) {
      messageApi.warning("กรุณาเลือกคาบที่ต้องการลบ");
      return;
    // }
    // const selectedRows = rows.filter(r => r.id && selectedIds.includes(r.id));
    // const uniqByCode = new Map<string, ScheduleInterface>();
    // for (const r of selectedRows) {
    //   if (r.course_code && !uniqByCode.has(r.course_code)) uniqByCode.set(r.course_code, r);
    }
    // const payload: Course[] = Array.from(uniqByCode.values()).map(r => ({
    //   id: String(r.id), 
    //   code: r.course_code!,
    //   name: r.course_name ?? "",
    // }));
    deleteSelected();
    // onDelete(payload);
    
  };

  const isEmpty = !loading && rows.length === 0;

  return (
    <Modal
      title="ลบรายวิชา"
      maskClosable={false}
      open={open}
      onCancel={onCancel}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Space>
            <Checkbox
              indeterminate={indeterminate}
              checked={allChecked}
              onChange={(e) => toggleAll(e.target.checked)}
            >
              เลือกทั้งหมด ({selectedIds.length}/{rows.length})
            </Checkbox>
          </Space>
          <Space>
            <Button onClick={onCancel}>ยกเลิก</Button>
            <Button type="primary" danger onClick={handleDelete}>
              ลบ
            </Button>
          </Space>
        </div>
      }
      width={860}
      style={{ maxWidth: "100vw" }}
      // getContainer={false}
      zIndex={1000}
    >
      {contextHolder}

      <Text type="secondary">
        เลือกคาบที่ต้องการลบจากตารางของ <b>ชั้น {gradeYear}/{gradeClass}</b> (เทอม {termId})
      </Text>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <Spin />
        </div>
      ) : isEmpty ? (
        <p style={{ marginTop: 16 }}>ไม่มีคาบให้ลบ</p>
      ) : (
        <List
          style={{ marginTop: 16, maxWidth: 820, width: 820 }}
          bordered
          dataSource={rows}
          renderItem={(item) => {
            const id = item.id as number;
            const checked = selectedIds.includes(id);
            return (
              <List.Item
                style={{ display: "block", background: checked ? "#f6ffed" : "white" }}
                onClick={() => toggleById(id)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <Checkbox
                    checked={checked}
                    disabled={!id}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e: CheckboxChangeEvent) => {
                      e.stopPropagation();
                      toggleById(id);
                    }}
                  />
                  <div style={{ width: "100%" }}>
                    <div style={{ fontWeight: 700 }}>
                      {item.course_code || "-"}: {item.course_name || "(ไม่มีชื่อวิชา)"}
                    </div>
                    <Divider style={{ margin: "8px 0" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>วัน: {item.day || "-"}</div>
                      <div>เวลา: {fmtTime(item)}</div>
                      <div>หน่วยกิต: {item.credit_num ?? "-"}</div>
                      <div>จำนวนคาบ/สัปดาห์: {item.class_in_week ?? "-"}</div>
                      <div>ชั่วโมง/เทอม: {item.hours_of_term ?? "-"}</div>
                      <div>กลุ่มสาระ: {item.subject_group || "-"}</div>
                      <div style={{ gridColumn: "1 / -1" }}>อาจารย์: {item.teacher_name || "-"}</div>
                    </div>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </Modal>
  );
};

export default DeleteCoursesModal;
