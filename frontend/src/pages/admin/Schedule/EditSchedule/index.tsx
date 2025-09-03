// components/EditCourseModal.tsx
import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import Selectday from "../../../../components/SelectDay";
import SelectTimeStart from "../../../../components/SelectTimeStart";
import SelectTimeEnd from "../../../../components/SelectTimeEnd";
import type { Course } from "../types"; 

// interface Course {
//   code: string;
//   name: string;
// }

interface EditCourseModalProps {
  open: boolean;
  onOk: (updatedCourse: {
    course: Course;
    day: string;
    startTime: string;
    endTime: string;
  }) => void;
  onCancel: () => void;
  initialCourse: Course | null;
  initialDay: string | null;
  initialStartTime: string | null;
  initialEndTime: string | null;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({
  open,
  onOk,
  onCancel,
  initialCourse,
  initialDay,
  initialStartTime,
  initialEndTime,
}) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(initialDay);
  const [startTime, setStartTime] = useState<string | null>(initialStartTime);
  const [endTime, setEndTime] = useState<string | null>(initialEndTime);

  useEffect(() => {
    if (open) {
      setSelectedDay(initialDay);
      setStartTime(initialStartTime);
      setEndTime(initialEndTime);
    }
  }, [open, initialDay, initialStartTime, initialEndTime]);

  const handleOk = () => {
    if (initialCourse && selectedDay && startTime && endTime) {
      onOk({
        course: initialCourse,
        day: selectedDay,
        startTime,
        endTime,
      });
    }
  };

  return (
    <Modal
      title="แก้ไขรายวิชา"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="บันทึก"
      cancelText="ยกเลิก"
      width={800}
      zIndex={7000}
      okButtonProps={{
        disabled: !initialCourse || !selectedDay || !startTime || !endTime,
      }}
    >
      <div className="input_S">
        {/* <Selectday value={selectedDay || ""} onChange={setSelectedDay} />
        <SelectTimeStart value={startTime || ""} onChange={setStartTime} />
        <SelectTimeEnd value={endTime || ""} onChange={setEndTime} /> */}
         <Selectday onChange={(value) => setSelectedDay(value)} />
        <SelectTimeStart onChange={(value) => setStartTime(value)} />
        <SelectTimeEnd onChange={(value) => setEndTime(value)} />
        <p>
          <strong>{initialCourse?.code}</strong>: {initialCourse?.name}
        </p>
      </div>
    </Modal>
  );
};

export default EditCourseModal;
