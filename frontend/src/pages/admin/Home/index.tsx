
import { Col,Row,Card,Statistic, Modal } from 'antd';
import{
    NotificationOutlined,
    UserOutlined,
    IdcardOutlined
}from '@ant-design/icons';
import Calendars from "../../../components/calendar";
import type { AnnouncementInterface } from '../../../interfaces/announcement';
import { announcementAPI } from '../../../services/https';
import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
const Home:React.FC = () => {
    const [announcements, setAnnouncements] = useState<AnnouncementInterface[]>([]);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementInterface | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await announcementAPI.getAnnouncements();
        console.log("📢 Announcements:", res);
        setAnnouncements(res);
        // const published = res?.data
        //   .filter((a: AnnouncementInterface) => a.status === "เผยแพร่แล้ว") // กรองเฉพาะเผยแพร่แล้ว
        //   .slice(0, 4); // เอาแค่ล่าสุด 4 รายการ
        // setAnnouncements(published);
      } catch (err) {
        console.error("❌ โหลดประกาศไม่สำเร็จ:", err);
        setAnnouncements([]);
      }
    };

    fetchAnnouncements();
  }, []);
    const openModal = (announcement: AnnouncementInterface) => {
        setSelectedAnnouncement(announcement);
        setModalVisible(true);
    };

    const closeModal = () => {
        setSelectedAnnouncement(null);
        setModalVisible(false);
    };

   
    return (
    <div style = {{
      background:"#fff",
      minHeight:"100vh",
      marginLeft:"6px",
      marginRight:"6px",
      borderRadius:"6px",
      }}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} style ={{padding: "16px"}}>
        {/* <Card style ={{background: "#ffdee2",height: "180px"}}> */}
            <Row gutter={[10,6]}>
            
            <Col xs={24} sm={24} md={24} lg={12} xl={8} style = {{border:30}}>
                <Card style = {{background: "#1976d2",height: "150px",marginTop:"0px",boxShadow:"1px 2px 3px grey",opacity:0.4}}>
                    <div style = {{ display: 'flex', flexDirection: 'column',}}>
                        {/* <div style={{textAlign: 'center',fontSize:24}}>
                            จำนวนประกาศ
                        </div> */}
                        <div style = {{ textAlign: 'left', fontSize: 18, color: '#ffffff', }}>
                            <NotificationOutlined style = {{marginRight: 16, fontSize:24, }}/>
                            จำนวนประกาศ
                        </div>
                        
                        <div style = {{ textAlign: 'center', fontSize: 36, fontWeight: 'bold', marginTop: 0,color:"#FFF"}}>
                            {announcements.length}
                        </div>
                    </div>
                </Card>
                
                
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={8} style = {{border:30}}>
                <Card style = {{marginTop: "0px",height:"150px",background:"#0d47a1",boxShadow:"1px 2px 3px grey",opacity:0.4}}>
                    <div style = {{ display: 'flex', flexDirection: 'column'}}>
                        <div style = {{ textAlign: 'left', fontSize: 18, color: '#fff'}}>
                            <UserOutlined style = {{marginRight: 16, fontSize:24}}/>
                                จำนวนนักเรียน
                        </div>
                        <div style = {{ textAlign: 'center', fontSize: 36, fontWeight: 'bold', marginTop: 0,color:"#fff"}}>
                            3100
                        </div>
                    </div>
                </Card>
                
                
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={8} style = {{border:30}}>
                <Card style = {{background:"#2979ff",height: '150px',boxShadow:"1px 2px 3px grey",opacity:0.4}}>
                    <div style = {{ display: 'flex', flexDirection: 'column'}}>
                        <div style = {{ textAlign: 'left', fontSize: 18, color: '#ffffff'}}>
                            <IdcardOutlined style = {{marginRight: 16, fontSize:24,}}/>
                                จำนวนบุคลากร
                        </div>
                        <div style = {{ textAlign: 'center', fontSize: 36, fontWeight: 'bold', marginTop: 0,color:"#FFF"}}>
                            200
                        </div>
                    </div>
                </Card>
                
                
            </Col>
        
            </Row>
        {/* </Card> */}
        </Col>
         <Col>
            
            <div style = {{color:"#015c91",fontSize:32,marginTop: 16,textShadow: "0px 2px 3px grey",marginLeft:"20px"}}>ข่าวประกาศ</div>
            
            
        </Col>
        {/* <Row gutter={[24,12]}> */}
        {/* <Col >
            <Card style = {{background: "#d8efff",width: "100%",marginTop: "16px",marginLeft:"16px"}}>
                
                {announcements.map((item, index) => (
                <Card  key= {index} style={{background:"#ffffff",height:"120px",marginBlock:"16px"}}>

                  <Statistic 
                //   title = "เรื่อง วันเปิดเรียน ภาคเรียนที่ 1 ปีการศึกษา 2569"
                title = {item.title} value={item.content}
                  />
                        
                  
                  
              </Card>))}
              <Card style={{background:"#FFFFFF",height:"120px",}}>
                  <Statistic 
                  title = "ประกาศผลการเรียน ภาคเรียนที่ 2 ปีการศึกษา 2567">

                  </Statistic>
              </Card>
                    
            </Card>
        </Col> */}
        {/* ประกาศทั้งหมด */}
      {/* <Col xs={24}>
        <Card style={{ background: "#d8efff", width: "100%", marginTop: "16px" }}>
          {announcements.length > 0 ? (
            announcements.map((item) => (
              <Card
                key={item.ID}
                style={{ background: "#ffffff", height: "120px", marginBlock: "16px" }}
              >
                <Statistic
                  title={item.title || "ไม่มีหัวข้อ"}
                  value={item.content || "ไม่มีรายละเอียด"}
                />
              </Card>
            ))
          ) : (
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 18 }}>
              ไม่พบประกาศ
            </div>
          )}
        </Card>
      </Col> */}
    <Col xs={24} sm={24} md={24} lg={24} xl={24} style ={{padding: "16px"}}>
    <Row gutter={[16, 16]}>
        {announcements.map((item) => (
          <Col xs={24} sm={12} key={item.ID}>
            <Card
              hoverable
              style={{ cursor: "pointer", boxShadow: "1px 2px 3px grey" }}
              onClick={() => openModal(item)}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
                  <NotificationOutlined style={{ marginRight: 8 }} />
                  {item.title || "ไม่มีหัวข้อ"}
                </div>
                <div style={{ fontSize: 14, color: "#555", marginBottom: 4 }}>
                  วันที่เผยแพร่: {item.create_date ? dayjs(item.create_date).format("YYYY-MM-DD") : "-"}
                </div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.content || "ไม่มีรายละเอียด"}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      </Col>

      <Modal
        title={selectedAnnouncement?.title}
        visible={modalVisible}
        onCancel={closeModal}
        footer={null}
      >
        <p>{selectedAnnouncement?.content}</p>
        <p><strong>วันที่เผยแพร่:</strong> {selectedAnnouncement?.create_date ? dayjs(selectedAnnouncement.create_date).format("YYYY-MM-DD") : "-"}</p>
        <p><strong>กลุ่มเป้าหมาย:</strong> {selectedAnnouncement?.target_group_id?.group_name || "-"}</p>
      </Modal>
        {/* <Col>
          <div style={{marginTop: "16px",}}> 
                
            <Calendars/>
            
          </div>
        </Col> */}
        {/* </Row> */}
    </div>
  );
};
export default Home;
