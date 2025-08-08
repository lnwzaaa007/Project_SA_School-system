import image from "../../../assets/courseTable.png"
import React, { useState } from 'react';
import { Col, Row, Card, Statistic, Table } from "antd";
const Home = () => {
  return (
    <div >
      <h1>ตารางเรียน ห้องม.5/2 <br/>
        <img src={image} alt={image} 
        style={{width:"800px",marginTop:"0px"}}/>
      </h1>
      <h1 style={{textAlign:'right',marginTop:"-630px",marginRight:"200px"}}> ประกาศข่าวสาร

      </h1>
        <Card style={{background:"#d8efff",marginLeft:"1000px",textAlign:'right',height:"500px"}}>

        </Card>
      
      
      {/* Add your schedule content here */}
    </div>
  );
};
export default Home;
