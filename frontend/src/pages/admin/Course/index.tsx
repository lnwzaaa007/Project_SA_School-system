import React, { useState} from 'react'
import { Col, Row, Card, Statistic, Table,Button, Modal} from "antd";
import SelectYear from '../../../components/SelectYear';
import SelectTerm from '../../../components/SelectTerm';
import CourseTable from '../../../components/CourseTable';
import {
    SearchOutlined,
    PlusOutlined,
    DeleteOutlined,
    FormOutlined
} from '@ant-design/icons';
import { Margin } from '@mui/icons-material';
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
  return (
    <div style = {{
      background:"#fff",
      minHeight:"100vh",
      marginLeft:"6px",
      marginRight:"6px",
      borderRadius:"6px",
    }}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} style ={{height:"100px", fontSize:"18px"}}>
                <div style = {{margin: "16px 0px 0px 0px",padding:"16px",}}>
                  รายวิชาทั้งหมด ปีการศึกษา <SelectYear/> ภาคการศึกษาที่ <SelectTerm/> 
                </div>
                
                <div style ={{textAlign:'right',marginRight:"10px", marginTop:"-44px",}}> 
                    <Button
                    icon={<SearchOutlined/>}
                    type='text'
                    onClick={showModal}
                    style = {{background:"#f0f7ff",marginRight:"10px"}}>
                        ค้นหา
                    </Button>
                    <Button 
                    icon={<PlusOutlined/>}
                    type = 'primary'
                    style={{marginRight:"10px"}}>
                      เพิ่ม
                    </Button>
                    <Button
                    icon = {<DeleteOutlined/>}
                    type = 'primary'
                    style = {{background:"#ff1818",marginRight:"10px"}}>
                      ลบ
                    </Button>
                    <Button
                    icon = {<FormOutlined/>}
                    type = 'primary'
                    style = {{background:"#ffca00"}}>
                      แก้ไข
                    </Button>
                </div> 
                
            </Col>
            <Col style = {{height:"100px",margin:"0px 16px 0px 16px"}}>
                <CourseTable />
            </Col>

      {/* Add your schedule content here */}
    </div>
  );
};
export default Course;
