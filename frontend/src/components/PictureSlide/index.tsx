import React from 'react';
import { Carousel } from 'antd';
import picture1 from '../../assets/sutPicture1.jpg'
import picture2 from '../../assets/school1.jpg'
const contentStyle: React.CSSProperties = {
  height: '870px',
  color: '#fff',
  lineHeight: '900px', // ตำแหน่งตัวข้อความ
  textAlign: 'center',
  background: '#364d79',
  };

const App: React.FC = () => (
  <Carousel autoplay>
    <div>
      <h3 style={contentStyle}><img  src={picture1} alt={picture1} 
        style={{

            width: '100%',
            height: '100%',
            objectFit: 'cover',

        }}/></h3>
    </div>
    <div>
      <h3 style={contentStyle}><img src={picture2} alt ={picture2}
        style={{
          width: '100%',
          height:'100%',
          objectFit:'cover',
        }}/></h3>
    </div>
    <div>
      <h3 style={contentStyle}>3</h3>
    </div>
    <div>
      <h3 style={contentStyle}>4</h3>
    </div>
  </Carousel>
);

export default App;