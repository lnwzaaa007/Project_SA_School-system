import React from 'react';
import { Carousel } from 'antd';
import picture1 from '../../assets/welcome.jpg'
import picture2 from '../../assets/school1.jpg'
import picture3 from '../../assets/pictureStudent.jpg'
import picture4 from '../../assets/scienceDay.jpg'
const contentStyle: React.CSSProperties = {
  height: '1000px', //ขนาดรูป
  color: '#fff',
  lineHeight: '900px', // ตำแหน่งตัวข้อความ
  textAlign: 'center',
  background: '#364d79',
  };

// const PictureSlide: React.FC = () => (
//   <Carousel autoplay>
//     <div>
//       <h3 style={contentStyle}><img  src={picture1} alt={picture1} 
//         style={{

//             width: '100%',
//             height: '100%',
//             objectFit: 'cover',

//         }}/></h3>
//     </div>
//     <div>
//       <h3 style={contentStyle}><img src={picture2} alt ={picture2}
//         style={{
//           width: '100%',
//           height:'100%',
//           objectFit:'cover',
//         }}/></h3>
//     </div>
//     <div>
//       <h3 style={contentStyle}>3</h3>
//     </div>
//     <div>
//       <h3 style={contentStyle}>4</h3>
//     </div>
//   </Carousel>
// );

// export default PictureSlide;
const carouselHeight = 550; // ปรับความสูงตามต้องการ

const PictureSlide: React.FC = () => (
  <Carousel autoplay>
    <div >
      <div style={{ height: carouselHeight }}>
        <img
          src={picture1}
          alt="slide1"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            
          }}
        />
      </div>
    </div>
    <div>
      <div style={{ height: carouselHeight }}>
        <img
          src={picture2}
          alt="slide2"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    </div>
    <div>
      <div style={{ height: carouselHeight, }}>
         <img
          src={picture3}
          alt="slide2"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        </div>
    </div>
    <div>
      <div style={{ height: carouselHeight, }}>
        <img
          src={picture4}
          alt="slide2"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    </div>
  </Carousel>
);

export default PictureSlide