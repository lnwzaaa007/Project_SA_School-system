import React, { useState, useEffect } from "react";
import { Modal, Input, List, message } from "antd";
import {ScheduleAPI} from "../../../../services/https"
import Selectday from "../../../../components/SelectDay";
import SelectTimeStart from "../../../../components/SelectTimeStart";
import SelectTimeEnd from "../../../../components/SelectTimeEnd";
import type {Course} from "../types"
import type {ScheduleCoureseInterface,PostSchedule} from "../../../../interfaces/Schedule"
import "./index.css";

// type SearchCourse = Omit<Course, "id">;

interface AddCourseModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (newCourse: Omit<Course, "id">) => void; // หรือจะให้ parent รับ payload ก็ได้
  termId: number;        // เช่น 1
  gradeYear: string;     // เช่น "5"
  gradeClass: number;    // เช่น 2
  fetchSchedule: () => void;
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({
  open,
  onOk,
  onCancel,
  termId,
  gradeYear,
  gradeClass,
  fetchSchedule,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);
  
  const [searchResults, setSearchResults] = useState<ScheduleCoureseInterface[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ScheduleCoureseInterface | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const [checkedTime,setCheckTime] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearchResults([]);
      setSelectedCourse(null);
      setSearchText("");
      setSelectedDay(null);
      setStartTime(null);
      setEndTime(null);
      setCheckTime(false);
    }
  }, [open]);

  // 🔎 เรียก API ด้วย "รหัสวิชา" ตัวเดียว
  const handleSearch = async (value: string) => {
    const code = (value || "").trim().toUpperCase();
    setSearchText(value);

    if (!code) {
      setSearchResults([]);
      setSelectedCourse(null);
      return;
    }

      try {
        setLoading(true);
        const res = await ScheduleAPI.getScheduleCourse(code);

        // ถ้า wrapper ของคุณคือ axios ปกติ:
        const payload = (res as any)?.data?.data ?? (res as any)?.data;
        // ถ้า wrapper ของคุณคืน data ตรง ๆ ให้ใช้: const payload = res;

        const arr: ScheduleCoureseInterface[] = Array.isArray(payload)
          ? payload
          : payload
          ? [payload]
          : [];

        setSearchResults(arr);

        if (!payload || (payload.error || payload.message)) {
          messageApi.warning(payload?.error || "ไม่พบรายวิชานี้");
          setSearchResults([]);
          setSelectedCourse(null);
          return;
        }
    } catch (err: any) {

      const status = err?.response?.status;
      if (status === 404) {
        messageApi.warning("ไม่พบรายวิชานี้");
      } else {
        messageApi.error(err?.message || "เกิดข้อผิดพลาดในการโหลดรายวิชา");
      }
      setSearchResults([]);
      setSelectedCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    if (!selectedCourse || selectedDay == null || startTime == null || endTime == null || termId == null || gradeYear == null || gradeClass == null) return;

    // NOTE: ให้ API ของคุณส่ง field id (course_id) มาด้วยในผล search
    // ถ้ายังไม่มี ให้เพิ่มใน backend/Interface:  teacher_id?: number ด้วยจะดี
    const payload: PostSchedule = {
      day_id:        selectedDay,
      teacher_id:    selectedCourse.teacher_id,
      time_start_id: startTime,
      time_end_id:   endTime,
      term_id:       termId,
      grade_year:    gradeYear,
      grade_class:   Number(gradeClass),
      course_id:     selectedCourse.id,            // ⬅ ต้องมี id จาก API
      // teacher_id: selectedCourse.teacher_id,    // ⬅ ถ้ามี
    };

    try {
      setSubmitting(true);
      const res = await ScheduleAPI.postSchedule(payload); // รับ response

      const ok =
        (res?.status >= 200 && res?.status < 300) ||
        (!!res?.data?.data && !res?.data?.error);

      if (!ok) {
        const msg = res?.data?.error || "บันทึกไม่สำเร็จ";
        throw new Error(msg);
      }

      message.success("บันทึกตารางเรียนสำเร็จ");
      //ดึงข้อมูลตารางเรียนที่เพิ่มล่าสุด 
      fetchSchedule(); 

      // ส่งข้อมูลย่อกลับให้ parent อัปเดต UI (ถ้าต้องการส่ง payload จริง ก็เปลี่ยน onOk type)
      // onOk({
      //   course_code:   selectedCourse.course_code ?? "",
      //   course_name:   selectedCourse.course_name ?? "",
      //   credit_num:    selectedCourse.credit_num,
      //   class_in_week: selectedCourse.class_in_week,
      //   hours_of_term: selectedCourse.hours_of_term,
      //   subject_group: selectedCourse.subject_group,
      //   teacher_name:  selectedCourse.teacher_name,
      //   teacher_id:    selectedCourse.teacher_id,
      // });

      // ปิด/รีเซ็ต
      onCancel();
    } catch (err: any) {
      message.error(err?.response?.data?.error || err?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };
  
  useEffect (() => {
    if(startTime == null || endTime == null) return;
    if(startTime === endTime){
      messageApi.error("ไม่สามารถเลือกเวลาซ้ำกันได้");
      console.log("ไม่สามารถเลือกเวลาซ้ำกันได้");
      setCheckTime(false);
      return;
    }
    if(startTime == 5 || endTime == 6){
      messageApi.error("ไม่สามารถเลือกช่วงเวลานี้ได้");
      setCheckTime(false);
      return;
    }
    if(startTime >= endTime){
      messageApi.error("เลือกเวลาจบคาบใหม่");
      setCheckTime(false);
      return;
    }
    setCheckTime(true);
  },[startTime,endTime]);
  console.log("selectedDay",selectedDay)

  return (
    <>
      {contextHolder}
      <Modal
        className="modal_add_schedule"
        maskClosable={false}
        // getContainer={false}
        title="เพิ่มรายวิชา"
        open={open}
        onOk={handleOk}
        onCancel={onCancel}
        okText="เพิ่ม"
        cancelText="ยกเลิก"
        width={800}
        zIndex={1000}
        confirmLoading={submitting}
        
        okButtonProps={{
          disabled: !selectedCourse || !selectedDay || !startTime || !endTime || !checkedTime,
        }}
      >
        <p>***เพิ่มรายวิชา***</p>

        <div className="input_S" >
          <Selectday value={selectedDay} onChange={setSelectedDay} />
          <SelectTimeStart value={startTime} onChange={setStartTime} />
          <SelectTimeEnd value={endTime} onChange={setEndTime} />

          <Input.Search
            className="search-input"
            placeholder="รหัสวิชา เช่น CS101"
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 250}}
            loading={loading}
            // allowClear

          />


          {searchResults.length > 0 && (
            <List
              style={{ marginTop: 16, maxWidth: 500, width: "100%" }}
              bordered
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item
                  onClick={() => setSelectedCourse(item)}
                  style={{
                    cursor: "pointer",
                    background:
                      selectedCourse?.course_code === item.course_code ? "#f6ffed" : "white",
                  }}
                >
                  <strong>{item.course_code}</strong> : {item.course_name}
                  <div style={{ fontSize: 14, color: "#555", marginTop: 4 ,paddingLeft: 12 }}>
                    <div>หน่วยกิต : {item.credit_num}</div>
                    <div>กลุ่มสาระ : {item.subject_group}</div>
                    <div>อาจารย์ : {item.teacher_name}</div>
                    <div>จำนวนคาบ/สัปดาห์ : {item.class_in_week}</div>
                    <div>ชั่วโมง/เทอม : {item.hours_of_term}</div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default AddCourseModal;
