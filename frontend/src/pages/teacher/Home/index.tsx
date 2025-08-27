import PictureSlide from '../../../components/PictureSlide'
import Calendars from '../../../components/calendar';
import { Col,Row,Card,Statistic } from 'antd';
const Home = () => {
  return (
    <>
    <div
        style={{
          background:"#fff",
          height:"100%",
          borderRadius:"16px"
        }}>
        <PictureSlide/>
      <Row gutter={16}>
        <Col span={12}>
        <h1
        style={{
          padding:'16px',
        }}>
          ประกาศข่าวสาร
          <Col span={12} xs={24} sm={24} md={24} lg={24} xl={24} style={{
            marginTop:'16px',
            background:'#d8efff',
            height:'1000px'
          }}>
          </Col>
        </h1>
        </Col>
        <Col span={12}>
        <h1 style = {{
          padding:'16px',
          color: '#383a66',
        }}>
          ปฏิทินการศึกษา 
          <div style = {{
            marginTop:'16px',
          }}>
          <Calendars/>
          </div>


        </h1>
        </Col>
      </Row>  

      {/* Add your schedule content here */}
    </div>
   
    </>
  );
};
export default Home;
