// import SelectCouse from "../../../../components/SelectCourse";
// import { Routes, Route, Link, Navigate } from "react-router-dom";
// import { Button, Table, Card } from "antd";
// import {
//   PlusOutlined,
//   DeleteOutlined,
//   FormOutlined,
// } from "@ant-design/icons";


// const Schedule = () => {
//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         padding: "50px 80px",
//         background: "#F1EEE0",
//         display: "flex",
//         justifyContent: "center",
//       }}
//       >
//       <Card
//         style={{
//             width: "100%",
//             maxWidth: "1400px",
//             borderRadius: 20,           
//         }}
//         bodyStyle={{ padding: "40px" }}
//       >
//         {/* Filter Section */}
//           <div
//             style={{
//                 marginLeft: "auto",
//                 display: "flex",
//                 gap: "12px",
//                 justifyContent: "center",
//             }}
//           >
//             <SelectCouse />
            
//         </div>
//         {/* Table Section */}
//         <div style={{ overflowX: "auto" }}>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default Schedule;

import { Input, Card } from "antd";
import { useState } from "react";
import './index.css';

const AddSchedule = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);

//   const handleSearch = (value) => {
//     // Logic สำหรับค้นหารายวิชา (สามารถใส่เพิ่มได้)
//     console.log("Search:", value);
//   };

 return (
  <div
    style={{
      minHeight: "100vh",
      padding: "50px 80px",
      background: "#F1EEE0",
      display: "flex",
      justifyContent: "center",
    }}
  >
    <Card
      style={{
        width: "100%",
        maxWidth: "2000px",
        borderRadius: "40px",
        background: "#fff",
      }}
      bodyStyle={{ padding: "40px" }}
    >
      {/* Filter Section */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginBottom: "24px",
          paddingTop: "40px",
        }}
      >
        <Input.Search
          className="search-input"
          placeholder="รหัสวิชา"
          enterButton
          style={{ width: 400, height: 50 }}
          // onSearch={handleSearch}
        />
      </div>

      {/* Subject Info */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 80px", marginBottom: "24px" }}>
        <div>
          <p><strong>ชื่อวิชา:</strong> คณิตศาสตร์พื้นฐาน1</p>
          <p><strong>ครูประจำรายวิชา:</strong> สมศรี ผ่องใจ</p>
        </div>
        <div>
          <p><strong>จำนวนคาบต่อสัปดาห์:</strong> 3</p>
          <p><strong>หน่วยกิต:</strong> 3</p>
        </div>
      </div>

      {/* Time Selection */}
      <div style={{ padding: "0 80px" }}>
        <div style={{ display: "flex", gap: "40px", marginBottom: "16px" }}>
          <Input placeholder="วัน" style={{ background: "#f6f6f6", borderRadius: "12px" }} />
        </div>
        <div style={{ display: "flex", gap: "40px" }}>
          <Input placeholder="เวลาเริ่ม" style={{ background: "#f6f6f6", borderRadius: "12px", width: "200px" }} />
          <Input placeholder="ถึง" style={{ background: "#f6f6f6", borderRadius: "12px", width: "200px" }} />
        </div>
      </div>

      {/* Confirm Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "40px 80px 0" }}>
        <button
          style={{
            backgroundColor: "#B3E5FC",
            border: "none",
            borderRadius: "16px",
            padding: "10px 30px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ยืนยัน
        </button>
      </div>
    </Card>
  </div>
);

};

export default AddSchedule;
