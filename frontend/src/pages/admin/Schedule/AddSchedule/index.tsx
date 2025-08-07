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
import Selectday from "../../../../components/SelectDay"
import SelectTimeStart from "../../../../components/SelectTimeStart"
import SelectTimeEnd from "../../../../components/SelectTimeEnd"
import "./index.css";

const mockCourses = [
  { code: "CS101", name: "Introduction to Computer Science" },
  { code: "CS102", name: "Data Structures" },
  { code: "CS103", name: "Algorithms" },
  { code: "MA101", name: "Calculus I" },
  { code: "PH101", name: "Physics for Engineers" },
];

const AddCourseModal = ({ open, onOk, onCancel }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (!open) {
      setSearchResults([]);
      setSelectedCourse(null);
      setSearchText("");
    }
  }, [open]);

  const handleSearch = (value) => {
    const results = mockCourses.filter((course) =>
      course.code.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(results);
    setSelectedCourse(null); // ล้างการเลือกเดิม
  };

  const handleSelectCourse = (course) => {
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
      title="เพิ่มรายวิชา"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="เพิ่ม"
      cancelText="ยกเลิก"
      width={800}
      zIndex={7000}
      okButtonProps={{ disabled: !selectedCourse }}
    >
      <div className="input_S" style={{height:150}}>
        {/* <Selectday/>
        <SelectTimeStart/>
        <SelectTimeEnd/> */}
        <Input.Search
          placeholder="ค้นหารหัสวิชา เช่น CS101"
          enterButton
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 250 }}
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
                    selectedCourse?.code === item.code ? "#e6f7ff" : "white",
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

