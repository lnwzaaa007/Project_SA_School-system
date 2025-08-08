
import { Link, Route, useNavigate,Outlet } from "react-router-dom";
import { Space, Table, Button, Col, Row, Divider, message, DatePicker, Input, Select } from "antd";
import { PlusOutlined, DeleteOutlined, FormOutlined, IdcardOutlined ,PushpinFilled, ArrowLeftOutlined   } from "@ant-design/icons";
import { Gradient } from "@mui/icons-material";
const { Option } = Select;
import BackButton from "../../../components/BackButton";
import Upload from "../../../components/Upload";
import React, { useState } from "react";
import ModalSave from "../../../components/ModalSeve";
import MadalCancel from "../../../components/ModalCancel";
import UploadImages from "../../../components/UploadImages";
import SelectGrade from "../../../components/SelectGrade";
import SelectClass from "../../../components/SelectClass";
import ModalCheckStatus from "../../../components/ModalCheckStatus";

const CheckStatus = () => {
  

  const navigate = useNavigate();
  
  return (
    <div style={{ justifyContent: "center",background: "#F1EEE0", minHeight: "100vh" ,padding: "20px"}}>
      
      
        <div style={{justifyContent: "center",boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: '24px', background : "linear-gradient(to left, #ffffffff, #ffffffff)", minHeight: '30vh', maxWidth: '35%' ,borderRadius: "32px" ,marginLeft : "31%",marginTop:"18%",alignItems: "center"}} >
          <h1 style={{justifyContent: "center", textAlign : "center"}}>ตรวจสอบสถานะ</h1>
          <Row style={{width: "100%", marginLeft : "center", alignItems: "center", justifyContent: "center"}}>
            <Col  style={{textAlign : "center"}}>
              <label style= {{lineHeight: "2",textAlign : "center", marginLeft : "center"}}>เลขบัตรประชาชน</label>
              <Input placeholder="กรอกเลขบัตรประชาชน" />
              <p></p>
              <ModalCheckStatus/>
            </Col>
          </Row>
        </div>
          
    

  
<div style={{marginLeft : "calc(44% + 24px)"}}>
          <Space>
            
          </Space>
      
    </div>

    
    
    
</div>
  );
};

export default CheckStatus;
