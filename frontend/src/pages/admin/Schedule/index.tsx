// import SelectGrade from "../../../components/SelectGrade";
// import SelectClass from "../../../components/SelectClass";
// import SelectTerm from "../../../components/SelectTerm";
// import { Routes, Route, Link, Navigate } from "react-router-dom";
// import {Button ,Table} from "antd"
// import {
//   PlusOutlined,
//   DeleteOutlined,
//   FormOutlined
// } from "@ant-design/icons";
// import Item from "antd/es/list/Item";

// const columns = [
  
//   {
//     title: "Day/Time",
//     dataIndex: "day",
//     key: "day",
//     align: "center",
//   },
//   {
//     title: "08.40-09.30",
//     dataIndex: "time1",
//     key: "time1",
//     align: "center",
//   },
//   {
//     title: "09.30-10.20",
//     dataIndex: "time2",
//     key: "time2",
//     align: "center",
//   },
//   {
//     title: "10.20-11.10",
//     dataIndex: "time3",
//     key: "time3",
//     align: "center",
//   },
//   {
//     title: "11.10-12.00",
//     dataIndex: "time4",
//     key: "time4",
//     align: "center",
//   },
//   {
//     title: "12.00-13.00",
//     dataIndex: "time5",
//     key: "time5",
//     align: "center",
//     render: (text, row, index) => {
//       if (index === 0) {
//         return {
//           children: "พักเที่ยง",
//           props: { rowSpan: 5 },
//         };
//       }
//       return {
//         children: null,
//         props: { rowSpan: 0 }, 
//       };
//     },
//   },
//   {
//     title: "13.00-13.50",
//     dataIndex: "time6",
//     key: "time6",
//     align: "center",
//   },
//   {
//     title: "13.50-14.40",
//     dataIndex: "time7",
//     key: "time7",
//     align: "center",
//   },
//   {
//     title: "14.40-15.30",
//     dataIndex: "time8",
//     key: "time8",
//     align: "center",
//   },
//   {
//     title: "15.30-16.30",
//     dataIndex: "time9",
//     key: "time9",
//     align: "center",
//   },
// ];

// const dataSource = [
//   { key: "1", day: "จันทร์"},
//   { key: "2", day: "อังคาร"},
//   { key: "3", day: "พุธ"},
//   { key: "4", day: "พฤหัส"},
//   { key: "5", day: "ศุกร์"},
// ];
// const Schedule = () => {
//   return (
//     <>
//       <div style={{  minHeight: "100vh",
//         margin: "0 auto",
//         padding: "100px",
//         background: "#fff",
//         borderTopLeftRadius:30,
//         borderBottomLeftRadius:30,
        
//         }}> 
//         <div>

//           <div style={{ 
//             padding: "20px",
//             gap: "24px", 
//             display: "flex",
//             flexWrap: "wrap",
//             paddingLeft:"40px",
//             }}>
//             <SelectGrade />
//             <SelectClass />
//             <SelectTerm />
//             <div style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   paddingLeft: "150px",
//                   gap:10
//             }}>
//               <Link to="/admin/schedule/add">
//                 <Button icon={<PlusOutlined/>} type="primary" style={{background:"#0088ff" ,width:80}}>
//                 เพิ่ม
//                 </Button>
//               </Link>
//               <Button icon={<DeleteOutlined/>} type="primary" style={{background:"#0088ff" ,width:80}}>
//                 ลบ
//               </Button>
//               <Button icon={<FormOutlined/>} type="primary" style={{background:"#0088ff" ,width:80}}>
//                 แก้ไข
//               </Button>
//             </div>
//             <div
//                style={{ 
//                   paddingTop: "100px",
//                   overflowX: "auto",    
//                 }}
//             >
//               <div
//               style={{ 
//                 minWidth: "1350px",
//                 display: "flex",
//                 justifyContent: "center",
              
//             }}>
//               <Table 
//               dataSource={dataSource}
//               columns={columns}
//               pagination={false} 
//               bordered 
//               style={{ width: "100%" }}
              
//             />
//             </div>
//             </div>
            
            
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
// export default Schedule;
import { useState } from "react";
import AddCourseModal from "./AddSchedule"
import SelectGrade from "../../../components/SelectGrade";
import SelectClass from "../../../components/SelectClass";
import SelectTerm from "../../../components/SelectTerm";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { Button, Table, Card,Modal } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  FormOutlined,
} from "@ant-design/icons";

const columns = [
  {
    title: "Day/Time",
    dataIndex: "day",
    key: "day",
    align: "center",
  },
  {
    title: "08.40-09.30",
    dataIndex: "time1",
    key: "time1",
    align: "center",
  },
  {
    title: "09.30-10.20",
    dataIndex: "time2",
    key: "time2",
    align: "center",
  },
  {
    title: "10.20-11.10",
    dataIndex: "time3",
    key: "time3",
    align: "center",
  },
  {
    title: "11.10-12.00",
    dataIndex: "time4",
    key: "time4",
    align: "center",
  },
  {
    title: "12.00-13.00",
    dataIndex: "time5",
    key: "time5",
    align: "center",
    render: (text, row, index) => {
      if (index === 0) {
        return {
          children: "พักเที่ยง",
          props: { rowSpan: 5 },
        };
      }
      return {
        children: null,
        props: { rowSpan: 0 },
      };
    },
  },
  {
    title: "13.00-13.50",
    dataIndex: "time6",
    key: "time6",
    align: "center",
  },
  {
    title: "13.50-14.40",
    dataIndex: "time7",
    key: "time7",
    align: "center",
  },
  {
    title: "14.40-15.30",
    dataIndex: "time8",
    key: "time8",
    align: "center",
  },
  {
    title: "15.30-16.30",
    dataIndex: "time9",
    key: "time9",
    align: "center",
  },
];

const dataSource = [
  { key: "1", day: "จันทร์" },
  { key: "2", day: "อังคาร" },
  { key: "3", day: "พุธ" },
  { key: "4", day: "พฤหัส" },
  { key: "5", day: "ศุกร์" },
];

const Schedule = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => setIsModalVisible(true);
  const handleOk = () => setIsModalVisible(false);
  const handleCancel = () => setIsModalVisible(false);
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
          borderRadius: 40,
        }}
        bodyStyle={{ padding: "40px" }}
      >
        {/* Filter Section */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            marginBottom: "32px",
            alignItems: "center",
          }}
        >
          <SelectGrade />
          <SelectClass />
          <SelectTerm />
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "12px",
            }}
          >
            {/* <Link to="/admin/schedule/add"> */}
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={showModal}
                style={{ background: "#1677FF" }}
              >
                เพิ่ม
              </Button>
            {/* </Link> */}
            <Button icon={<DeleteOutlined />} danger>
              ลบ
            </Button>
            <Button icon={<FormOutlined />} style={{ background: "#faad14", color: "#fff" }}>
              แก้ไข
            </Button>
            <AddCourseModal open={isModalVisible} onOk={handleOk} onCancel={handleCancel}/>
          </div>
        </div>


        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            bordered
            style={{ minWidth: "1200px" }}
          />
        </div>
      </Card>
    </div>
  );
};

export default Schedule;
