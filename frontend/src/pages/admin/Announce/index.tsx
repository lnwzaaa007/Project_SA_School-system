import React, { useState } from 'react';
import { Col, Row, Card, Statistic, Table ,Button, } from "antd";
import { Link, Route, Routes } from 'react-router-dom';
import{
    NotificationOutlined,
    FileDoneOutlined,
    FileSyncOutlined,
    FormOutlined,
    PlusOutlined, 
    DeleteOutlined
}from '@ant-design/icons';
import CreateAnnouncement from './CraeteAnnouncement';
import EditAnnouncement from './EditAnnouncement';

const Announce: React.FC = () => {
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
      <Col xs={24} sm={24} md={24} lg={24} xl={24} style ={{padding: "16px"}}>
        {/* <Card style ={{background: "#ffdee2",height: "180px"}}> */}
            <Row gutter={[10,6]}>
            
            <Col xs={24} sm={24} md={24} lg={12} xl={8} style = {{border:30}}>
                <Card style = {{background: "#a6e2fc",height: "150px",marginTop:"0px",boxShadow:"1px 2px 3px grey"}}>
                    <div style = {{ display: 'flex', flexDirection: 'column',}}>
                        {/* <div style={{textAlign: 'center',fontSize:24}}>
                            จำนวนประกาศ
                        </div> */}
                        <div style = {{ textAlign: 'left', fontSize: 18, color: '#ffffff',marginTop:"-10px" }}>
                            <NotificationOutlined style = {{marginRight: 16, fontSize:24, }}/>
                            ประกาศทั้งหมด
                        </div>
                        
                        <div style = {{ textAlign: 'center', fontSize: 36, fontWeight: 'bold', marginTop: -6,color:"#FFF"}}>
                            30
                        </div>
                    </div>
                </Card>
                
                
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={8} style = {{border:30}}>
                <Card style = {{marginTop: "0px",height:"150px",background:"#c0e8c6",boxShadow:"1px 2px 3px grey"}}>
                    <div style = {{ display: 'flex', flexDirection: 'column'}}>
                        <div style = {{ textAlign: 'left', fontSize: 18, color: '#fff',marginTop:"-10px"}}>
                            <FileDoneOutlined style = {{marginRight: 16, fontSize:24}}/>
                                เผยแพร่แล้ว
                        </div>
                        <div style = {{ textAlign: 'center', fontSize: 36, fontWeight: 'bold', marginTop: -6,color:"#fff"}}>
                            100
                        </div>
                    </div>
                </Card>
                
                
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={8} style = {{border:30}}>
                <Card style = {{background:"#fee4a7",height: '150px',boxShadow:"1px 2px 3px grey"}}>
                    <div style = {{ display: 'flex', flexDirection: 'column'}}>
                        <div style = {{ textAlign: 'left', fontSize: 18, color: '#ffffff',marginTop:"-10px"}}>
                            <FileSyncOutlined style = {{marginRight: 16, fontSize:24,}}/>
                                ฉบับร่าง
                        </div>
                        <div style = {{ textAlign: 'center', fontSize: 36, fontWeight: 'bold', marginTop: -6,color:"#FFF"}}>
                            15
                        </div>
                    </div>
                </Card>
            </Col>
        
            </Row>
          </Col>
          <Col>
              <div style ={{textAlign:'right',marginRight:"6px", marginTop:"0px",}}> 
                <Link to = 'CreateAnnouncement'>
                <Button 
                    icon={<PlusOutlined/>}
                    type = 'primary'
                    style={{marginRight:"10px"}}>
                      สร้างประกาศใหม่
                  </Button>
                  </Link>

                  
              </div>
          </Col>
          <Col style = {{padding:"16px",}}>
            <Card style= {{background:"#E9F6FF",height:"150px"}}>
              <div style = {{textAlign:'left',fontSize: "24px",color:"#000000"}}>
                วันเปิดเรียน ภาคการศึกษาที่ 1 ปีการศึกษา 2569
              </div>
              <div style={{textAlign:"left",fontSize:18,color:"#999"}}>
                นักเรียนทุกระดับชั้น<br/>
                16 เมษายน 2569
              </div>
              <div style={{textAlign:"right",marginTop:"-30px",fontSize:16,color:"#999"}}>
                เผยแพร่เมื่อ 16 เมษายน 2569 เวลา 08:00 น. โดย ผู้ดูแลระบบ
              </div>
              <div style={{textAlign:"right",marginTop:"-90px"}}>
              <Link to = 'EditAnnouncement'>
                  <Button
                    icon={<FormOutlined/>}
                    // type='primary'
                    onClick={showModal}
                    style = {{color:"#42a5f5",marginRight:"10px",borderColor:"#42a5f5"}}>
                        {/* แก้ไข */}
                  </Button>
              </Link>
              <Button
                    icon={<DeleteOutlined/>}
                    // type='primary'
                    onClick={showModal}
                    style = {{color:"#ff3d00",borderColor:"#ff3d00"}}>
                        {/* ลบ */}
              </Button>
              </div>
              
            </Card>
          </Col>
          <Col style = {{padding:"16px",}}>
            <Card style= {{background:"#E9F6FF",height:"150px"}}>
            </Card>
          </Col>
          <Col style = {{padding:"16px",}}>
            <Card style= {{background:"#E9F6FF",height:"150px"}}>
            </Card>
          </Col>
          <Col style = {{padding:"16px",}}>
            <Card style= {{background:"#E9F6FF",height:"150px"}}>
            </Card>
          </Col>

          <Routes>
            <Route path='CreateAnnouncement' element={<CreateAnnouncement/>}/>
            <Route path='EditAnnouncement' element={<EditAnnouncement/>}/>
          </Routes>
    </div>
  );
};
export default Announce;
