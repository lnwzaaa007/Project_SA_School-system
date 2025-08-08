import { useState } from 'react'
import './component/StudentShow.css'
import {HomeOutlined } from '@ant-design/icons';
import {SolutionOutlined } from '@ant-design/icons';
import {DownOutlined } from '@ant-design/icons';
import {UpOutlined } from '@ant-design/icons';


function HistoryAddressS() {
  const [show,setShow]=useState(true)
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
                 <div className='content2Left-Item'>
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
                      <span style={{ paddingLeft: '16px', fontSize: '15px' }}>ข้อมูลทั่วไป</span>
                    </div>
                  </div>
                 </div>
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
               <div className='content2RightFun'>
                <div className='cursor'>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%', // เพื่อให้ปุ่มไปชิดขวา
                  }}
                >
                  <div>ที่อยู่ที่ติดต่อได้</div>

                    <button onClick={() => setShow(!show)}>
                      {show ? <UpOutlined /> : <DownOutlined />}
                    </button>
                </div>
                </div>
                  {show&& (
                <div>
                <div className='flex-content'>
                  <div className='student-sub-title'>บ้านเลขที่</div>
                  <div className='student-sub-detail'>123/4</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>ถนน</div>
                  <div className='student-sub-detail'>มิตรภาพ</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>ตำบล/แขวง</div>
                  <div className='student-sub-detail'>เมืองนครราชสีมา</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>อำเภอ/เขต</div>
                  <div className='student-sub-detail'>สุรนารี</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>จังหวัด</div>
                  <div className='student-sub-detail'>นครราชสีมา</div>
                </div>
                <div className='flex-content'>
                  <div className='student-sub-title'>รหัสไปรษณีย์</div>
                  <div className='student-sub-detail'>30000</div>
                </div>
                </div>
                  )}


               </div>

            </div>
          </div>

        </div>
}</>
  )}
                
     
    

  
export default HistoryAddressS