import React, { useState} from 'react'
import { Col, Row, Card, Statistic, Table,Button, Modal, Divider, Form, Input} from "antd";
import {Routes, Route, Link, useNavigate} from 'react-router-dom';
import SelectYear from '../../../components/SelectYear';
import SelectTerm from '../../../components/SelectTerm';
import CourseTable from '../../../components/CourseTable';
import CreateCourse from './CreateCourse';
import DeleteCourse from './Delete';
import EditCourse from './edit';
import {
    SearchOutlined,
    PlusOutlined,
    DeleteOutlined,
    // FormOutlined
} from '@ant-design/icons';
//import { Margin, Spa } from '@mui/icons-material';
const Course:React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  
  const onFinish = (values: any) => {
    // ส่งข้อมูลไป backend หรือจัดการข้อมูลที่นี่
    // ตัวอย่าง: console.log(values);
    // เสร็จแล้วค่อย navigate กลับ
    navigate('/admin/course');
  };
  return (
    <div style = {{
      background:"#fff",
      minHeight:"100vh",
      marginLeft:"6px",
      marginRight:"6px",
      borderRadius:"6px",
      }}>
      
      <Col style={{
        width:'100%',
        padding:'16px',        
      }}>
        {/* ปุ่มเลือกปีการศึกษา */}
        <div style={{
          display: 'flex',
          flexWrap:'wrap',
          gap:'8px',
          alignItems:'center',
          padding:'16px',

          }}>
          <SelectYear/>
          <SelectTerm/>
          {/* ปุ่มเพิ่มแก้ไขลบ */}
          <div style={{
            marginLeft:'auto',
            display:'flex',
            
            }}>
           <Button
              icon={<SearchOutlined/>}
              type='text'
              onClick={showModal}
              style = {{background:"#f0f7ff",marginRight:"10px"}}>
                ค้นหา
            </Button>
            <Modal  title="Basic Modal"
              closable={{ 'aria-label': 'Custom Close Button' }}
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
              zIndex={5000}>
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>

            <Link to='CreateCourse'>
            <Button 
              icon={<PlusOutlined/>}
              type = 'primary'
              style={{marginRight:"10px"}}
              onClick={() => setCollapsed(!collapsed)}>
                เพิ่มรายวิชา
            </Button>
            </Link>
            
            {/* <Link to='DeleteCourse'>
            <Button
              icon = {<DeleteOutlined/>}
              type = 'primary'
              style = {{background:"#ff1818",marginRight:"10px"}}>
                ลบ
            </Button>
            </Link> */}
            
        
          </div>
          
        </div>

        {/* ตารางแสดงข้อมูลรายวิชา */}
        <div style = {{height:"100px",padding:'16px',}}>
          <Divider/> 
            <CourseTable />
        </div>
      </Col>

      {/* ตารางแสดงข้อมูลรายวิชา
      <div style = {{height:"100px",padding:'16px',}}>
        <Divider/>
          <CourseTable />
      </div> */}

      {/* Add your schedule content here */}
      <Routes>
        <Route path='/CreateCourse' element={<CreateCourse/>}/>
        <Route path='/DeleteCourse' element={<DeleteCourse/>}/>
      </Routes>
    </div>
  );
};
export default Course;
