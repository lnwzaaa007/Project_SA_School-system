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

  const handleSearch = (value) => {
    // Logic สำหรับค้นหารายวิชา (สามารถใส่เพิ่มได้)
    console.log("Search:", value);
  };

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
        }}
        bodyStyle={{ padding: "40px" }}
      >
        {/* Filter Section */}
        <div
          style={{
            width: "100%",
            display: "flex",
            height:"100px",
            justifyContent: "center",
            marginBottom: "24px",
            paddingTop:"40px",
            background:"#000"
          }}
        >
          <Input.Search className="search-input"
            placeholder="รหัสวิชา"
            enterButton
            style={{ width: 400,height: "1000px",}}
            onSearch={handleSearch}
          />
        </div>
        <div>
            <p>ชื่อวิชา</p>
        </div>
      </Card>
    </div>
  );
};

export default AddSchedule;
