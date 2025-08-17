
import { useState } from 'react'
// import { Button } from '@mui/material';
import './index.css'
import {HomeOutlined } from '@ant-design/icons';
import {SolutionOutlined } from '@ant-design/icons';
import {DownOutlined } from '@ant-design/icons';
import {UpOutlined } from '@ant-design/icons';

const StudentProfile = () => {
  
  const [showPersonal, setShowPersonal] = useState(true);
  const [showFather, setShowFather] = useState(true);
  const [showMother, setShowMother] = useState(true);

  return (
    <>
    {
    <div className="container"> 
        <div className="main">
          
          
            </div>
          <div className='content1'>
            <div className='content1Show'>
              <div className='content1ShowP'></div>
              <div className='content1ShowInfor'>นางสาว อัฐภิญญา จันทร์หนองหว้า</div>
            </div>
          </div>

          <div className='content2'>

            <div className='content2Left'>
              <div className='content2LeftFun'>
                 <div className='content2Left-Item1'>
                  <div className='content2Left-ItemInner'>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                          style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <SolutionOutlined style={{ fontSize: 24 }} />
                      </div>
                       <span className="menu-label" style={{ paddingLeft: 16, fontSize: 15 }}>
                        ข้อมูลทั่วไป
                      </span>
                    </div>
                  </div>
                 </div>
                 <div className='content2Left-Item'>
                  <a href="../src/HistoryAddressS.tsx"></a>
                  <div className='content2Left-ItemInner'>

                     <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                          style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <HomeOutlined style={{ fontSize: 24 }} />
                      </div>
                      <span style={{ paddingLeft: '16px', fontSize: '15px' }}>ที่อยู่</span>
                    </div>
                  </div>
                 </div>
              </div>
            </div>

            <div className='content2Right'>

              {/* ส่วนบุคคล */}
               <div className='content2RightFun'>    {/*ใหญ๋สุด*/}
                <div className='cursor'>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%', // เพื่อให้ปุ่มไปชิดขวา
                  }}
                >
                  <div>ข้อมูลส่วนบุคคล</div>

                    <button onClick={() => setShowPersonal(!showPersonal)}>
                      {showPersonal ? <UpOutlined /> : <DownOutlined />}
                    </button>
                </div>
                </div>
                {showPersonal && (
                  <div>
                <div className='flex-content'>
                  <div className='student-sub-title'>บัตรประจำตัวประชาชน</div>
                  <div className='student-sub-detail'>1-2345-67890-12-3</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>ชื่อ-นามสกุล (TH)</div>
                  <div className='student-sub-detail'>นางสาว อัฐภิญญา จันทร์หนองหว้า</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>ชื่อ-นามสกุล (EN)</div>
                  <div className='student-sub-detail'>Miss Attapinya Jannongwa</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>เพศ</div>
                  <div className='student-sub-detail'>หญิง</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>วันเกิด</div>
                  <div className='student-sub-detail'>17 ส.ค. 2547</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>สัญชาติ</div>
                  <div className='student-sub-detail'>ไทย</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>ศาสนา</div>
                  <div className='student-sub-detail'>พุทธ</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>เบอร์โทรศัพท์ติดต่อ</div>
                  <div className='student-sub-detail'>012-345-6789</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>E-mail</div>
                  <div className='student-sub-detail'>abc@gmail.com</div>
                </div>  
                </div>
                   )}
               </div>
               

               {/* ข้อมูลบิดา */}
                <div className='content2RightFun'>
                  <div className='cursor'>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%', // เพื่อให้ปุ่มไปชิดขวา
                  }}
                >
                  <div>ข้อมูลบิดา</div>

                 <button onClick={() => setShowFather(!showFather)}>
                  {showFather ? <UpOutlined /> : <DownOutlined />}
                </button>
                </div>
                </div>
                  {showFather && (
                <div>
                <div className='flex-content'>
                  <div className='student-sub-title'>บัตรประจำตัวประชาชน</div>
                  <div className='student-sub-detail'>1-2345-67890-12-3</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>ชื่อ-นามสกุล (TH)</div>
                  <div className='student-sub-detail'>นาย มั่งมี ร่ำรวย</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>เบอร์โทรศัพท์ติดต่อ</div>
                  <div className='student-sub-detail'>012-345-6789</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>วันเกิด</div>
                  <div className='student-sub-detail'>1 ม.ค 2520</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>อาชีพ</div>
                  <div className='student-sub-detail'>เกษตรกร</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>สถานะ</div>
                  <div className='student-sub-detail'>มีชีวิต</div>
                </div>
               </div>
                  )}
                </div>

               {/* ข้อมูลมารดา */}
                <div className='content2RightFun'>
                <div className='cursor'>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%', // เพื่อให้ปุ่มไปชิดขวา
                  }}
                >
                  <div>ข้อมูลมารดา</div>

                 <button onClick={() => setShowMother(!showMother)}>
                  {showMother ? <UpOutlined /> : <DownOutlined />}
                </button>
                </div>
                </div>

                  {showMother && (
                <div>
                <div className='flex-content'>
                  <div className='student-sub-title'>บัตรประจำตัวประชาชน</div>
                  <div className='student-sub-detail'>1-2345-67890-12-3</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>ชื่อ-นามสกุล (TH)</div>
                  <div className='student-sub-detail'>นาง วาสนา สมหวัง</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>เบอร์โทรศัพท์ติดต่อ</div>
                  <div className='student-sub-detail'>012-345-6789</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>วันเกิด</div>
                  <div className='student-sub-detail'>1 ม.ค. 2521</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>อาชีพ</div>
                  <div className='student-sub-detail'>พนังงานบริษัท</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>สถานะ</div>
                  <div className='student-sub-detail'>มีชีวิต</div>
                </div>
               </div>
                  )}
                  </div>
                  
            </div>
          </div>

        </div>
 }
 </>
  )}

export default StudentProfile;