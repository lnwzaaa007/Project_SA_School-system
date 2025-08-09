import React, { useState, useEffect, FC } from "react";
import { Modal, List, Checkbox } from "antd";
import type { Course } from "../types"; 
// interface Course {
//   code: string;
//   name: string;
// }

interface DeleteCoursesModalProps {
  open: boolean;
  onCancel: () => void;
  onDelete: (selectedCourses: Course[]) => void;
  courses: Course[];
}

const DeleteCoursesModal: FC<DeleteCoursesModalProps> = ({
  open,
  onCancel,
  onDelete,
  courses = [],
}) => {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setSelectedCodes([]);
    }
  }, [open]);

  const handleToggleCourse = (code: string) => {
    setSelectedCodes((prevSelected) =>
      prevSelected.includes(code)
        ? prevSelected.filter((c) => c !== code)
        : [...prevSelected, code]
    );
  };

  const handleDelete = () => {
    const filtered = courses.filter((course) =>
      selectedCodes.includes(course.code)
    );
    onDelete(filtered);
  };

  return (
    <Modal
      className="input_S"
      title="ลบรายวิชา"
      open={open}
      onCancel={onCancel}
      onOk={handleDelete}
      okText="ลบ"
      cancelText="ยกเลิก"
      zIndex={7000}
      width={800}
       style={{ maxWidth: "100vw" }}
      okButtonProps={{ danger: true, disabled: selectedCodes.length === 0 }}
    >
      <p>***ลบรายวิชา***</p>
      {courses.length === 0 ? (
        <p>ไม่มีรายวิชาให้ลบ</p>
      ) : (
        <List
          style={{ marginTop: 16, maxWidth: 800, width: "800px" }}
          bordered
          dataSource={courses}
          renderItem={(item) => {
            const isSelected = selectedCodes.includes(item.code);
            return (
              <List.Item
                onClick={() => handleToggleCourse(item.code)}
                style={{
                  cursor: "pointer",
                  background: isSelected ? "#f6ffed" : "white", // สีพื้นหลังเมื่อถูกเลือก
                }}
              >
                <Checkbox checked={isSelected}>
                  <strong>{item.code}</strong>: {item.name}
                </Checkbox>
              </List.Item>
            );
          }}
        />
      )}
    </Modal>
  );
};

export default DeleteCoursesModal;
