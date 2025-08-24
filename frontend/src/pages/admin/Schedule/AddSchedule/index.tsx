// import React from "react";
// import "./index.css"
// import { Modal, Input } from "antd";

// const AddCourseModal = ({ open, onOk, onCancel }) => {
//   return (
//     <Modal
//       title="เพิ่มรายวิชา"
//       open={open}
//       onOk={onOk}
//       onCancel={onCancel}
//       okText="เพิ่ม"
//       cancelText="ยกเลิก"
//       width={800}
//       zIndex={7000}
//     >
//       {/* ตัวอย่างฟอร์มเบื้องต้น */}
//       <div className="input_S" >
//         <Input.Search className="search-input"
//             placeholder="รหัสวิชา"
//             enterButton
//             style={{ width: 400,height: 50,justifyContent: "center",}}
//           />
//         {/* เพิ่ม field ตามต้องการ */}
//       </div>
//     </Modal>
//   );
// };

// export default AddCourseModal;

import React, { useState, useEffect } from "react";
import { Modal, Input, List } from "antd";
import Selectday from "../../../../components/SelectDay";
import SelectTimeStart from "../../../../components/SelectTimeStart";
import SelectTimeEnd from "../../../../components/SelectTimeEnd";

// import type { Course } from "../types"; 
import "./index.css";

interface Course {
  code: string;
  name: string;
}

const mockCourses: Course[] = [
  { code: "CS101", name: "Introduction to Computer Science" },
  { code: "CS102", name: "Data Structures" },
  { code: "CS103", name: "Algorithms" },
  { code: "MA101", name: "Calculus I" },
  { code: "PH101", name: "Physics for Engineers" },
];

interface AddCourseModalProps {
  open: boolean;
  onOk: (newCourse: Omit<Course, "id">) => void;
  onCancel: () => void;
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({
  open,
  onOk,
  onCancel,
}) => {
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);


  useEffect(() => {
    if (!open) {
      setSearchResults([]);
      setSelectedCourse(null);
      setSearchText("");
    }
  }, [open]);

  const handleSearch = (value: string) => {
    const results = mockCourses.filter((course) =>
      course.code.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(results);
    setSelectedCourse(null); // ล้างการเลือกเดิม
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleOk = () => {
    if (selectedCourse) {
      onOk(selectedCourse);
    }
  };

  return (
    <Modal

      className="modal_add_schedule"

      maskClosable={false}
      title="เพิ่มรายวิชา"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="เพิ่ม"
      cancelText="ยกเลิก"
      width={800}
      zIndex={7000}
      okButtonProps={{
        disabled: !selectedCourse || !selectedDay || !startTime || !endTime,
      }}
    >


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

        />


        {searchResults.length > 0 && (
          <List
            style={{ marginTop: 16, maxWidth: 500, width: "100%" }}
            bordered
            dataSource={searchResults}
            renderItem={(item) => (
              <List.Item
                onClick={() => handleSelectCourse(item)}
                style={{
                  cursor: "pointer",
                  background:
                    selectedCourse?.code === item.code ? "#f6ffed" : "white",
                }}
              >
                <strong>{item.code}</strong>: {item.name}
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  );
};

export default AddCourseModal;
