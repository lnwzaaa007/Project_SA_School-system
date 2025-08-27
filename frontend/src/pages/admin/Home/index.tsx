
import { Col,Row,Card,Statistic } from 'antd';
import{
    NotificationOutlined,
    UserOutlined,
    IdcardOutlined
}from '@ant-design/icons';
import Calendars from "../../../components/Calendar";

const Home = () => {
  
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
                <Card style = {{background: "#1976d2",height: "150px",marginTop:"0px",boxShadow:"1px 2px 3px grey"}}>
                    <div style = {{ display: 'flex', flexDirection: 'column',}}>
                        {/* <div style={{textAlign: 'center',fontSize:24}}>
                            จำนวนประกาศ
                        </div> */}
                        <div style = {{ textAlign: 'left', fontSize: 18, color: '#ffffff', }}>
                            <NotificationOutlined style = {{marginRight: 16, fontSize:24, }}/>
                            จำนวนประกาศ
                        </div>
                        
                        <div style = {{ textAlign: 'center', fontSize: 36, fontWeight: 'bold', marginTop: 0,color:"#FFF"}}>
                            30
                        </div>
                    </div>
                </Card>
                
                
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={8} style = {{border:30}}>
                <Card style = {{marginTop: "0px",height:"150px",background:"#0d47a1"}}>
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
                <Card style = {{background:"#2979ff",height: '150px'}}>
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
        <Row gutter={[24,12]}>
        <Col>
            <Card style = {{background: "#d8efff",width: "1000px",marginTop: "16px",height: "670px",marginLeft:"16px"}}>
                
              <Card style={{background:"#ffffff",height:"120px",marginBlock:"16px"}}>
                  <Statistic 
                  title = "เรื่อง วันเปิดเรียน ภาคเรียนที่ 1 ปีการศึกษา 2569"
                  >
                        
                  </Statistic>
              </Card>
              <Card style={{background:"#FFFFFF",height:"120px",}}>
                  <Statistic 
                  title = "ประกาศผลการเรียน ภาคเรียนที่ 2 ปีการศึกษา 2567">

                  </Statistic>
              </Card>
                    
            </Card>
        </Col>
        <Col>
          <div style={{marginTop: "16px",}}> 
                
            <Calendars/>
            
          </div>
        </Col>
        </Row>
    </div>
  );
};
export default Home;
