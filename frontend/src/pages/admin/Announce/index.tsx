import React, { useState, useEffect } from 'react';
import { Col, Row, Card, Statistic, Table ,Button, Space, message, Form, Modal} from "antd";
import type { TableProps } from 'antd';
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
import type { AnnouncementInterface } from '../../../interfaces/announcement';
import { announcementAPI } from '../../../services/https';
import type { TargetGroupInterface } from '../../../interfaces/targetgroup';
import { targetGroupAPI } from '../../../services/https';
import { adminAPI } from '../../../services/https';

interface Announcement {
  ID: number;
  title: string;
  content: string;
  category:          string;
  status:            string;
  create_date:       string;
  end_date:          string;
  target_group_id:   number;
  user_id:           number;
  admin_id:          number;
  term_id:           number;
  enrollment_id:     number;
  
}

interface Category {
  value: string;
  label: string;
  colorClass: string; // ใช้ Tailwind class แบบเดียวกันทั้งหมด
}

const Announce: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementInterface[]>([]);
  const [targetGroups, setTargetGroups] = useState<TargetGroupInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementInterface | null>(null);
  const [data, setData] = useState<AnnouncementInterface[]>([]);
  const [admins, setAdmins] = useState<{ id: number, name: string }[]>([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState<any>(null);
  
  
  
  
  const [messageApi, contextHolder] = message.useMessage();

  const fetchTargetGroups = async () => {
          try {
              const res = await targetGroupAPI.getTargetGroupAll();
              console.log("📌 TargetGroup API response:", res);
  
              if (Array.isArray(res)) {
                  setTargetGroups(res);
              }else{
                  messageApi.error('ไม่พบข้อมูลกลุ่มเป้าหมาย');
              }
          } catch (err) {
              console.error('❌ โหลด Target Groups ผิดพลาด:', err);
          }
      };
      
  useEffect(() => {
      const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementAPI.getAnnouncements();
      console.log("ประกาศทั้งหมด",response);
      // const data = await response.json();
      setAnnouncements(response);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
    finally {
      setLoading(false);
    }
  };
    fetchAnnouncements();
    fetchTargetGroups();
  }
, []);

  // const showModal = () => {
  //   setIsModalOpen(true);
  // };
  const showDeleteModal = (record: any) => {
    setDeleteRecord(record);
    setIsDeleteModalOpen(true);
  };
  //ปุ่มยืนยันลบ
    const handleDeleteOk = () => {
      // ใส่ฟังก์ชันลบข้อมูลที่นี่ เช่น ลบ deleteRecord ออกจาก data
      setIsDeleteModalOpen(false);
      setDeleteRecord(null);
      // setShowDeleteSuccess(true);
      messageApi.success({content:"ลบสำเร็จ",  duration: 2 ,});
      console.log("ลบสำเร็จ"); // เพิ่มบรรทัดนี้
      console.log("setShowDeleteSuccess true");
      
    };
  //ปุ่มยกเลิก
    const handleDeleteCancel = () => {
      setIsDeleteModalOpen(false);
      setDeleteRecord(null);
  
    };
    const handleDeleteConfirm = async () => {
      if (!deleteRecord) {
        messageApi.error({ content: 'ไม่มีข้อมูลที่จะลบ', duration: 2 });
        return;
      }
      try {
        console.log("กำลังลบ id:", deleteRecord.ID);
        await announcementAPI.deleteAnnouncement(deleteRecord.ID);
  
        //อัปเดตตาราง รีเฟรชอัตโนมัติ
        setAnnouncements((prev) => prev.filter((item) => item.ID !== deleteRecord.ID));
        messageApi.success({ content: 'ลบข้อมูลสำเร็จ', duration: 2 });
      } catch (error) {
        console.error('❌ ลบข้อมูลผิดพลาด:', error);
        messageApi.error({ content: 'เกิดข้อผิดพลาดในการลบข้อมูล', duration: 2 });
      }finally {
        setIsDeleteModalOpen(false);
        setDeleteRecord(null);
      }
    };
    //ปุ่มเผยแพร่
    const handlePublish = async (ID: number) => {
    try {
      await announcementAPI.publishAnnouncement(ID);

      // วิธี 1: อัปเดต state โดยตรง
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.ID === ID ? { ...item, status: "published" } : item
        )
      );

      // หรือ วิธี 2: reload จาก backend
      // fetchAnnouncements();

      message.success("เผยแพร่สำเร็จ");
    } catch (error) {
      console.error("❌ Publish failed:", error);
      message.error("เกิดข้อผิดพลาดในการเผยแพร่");
    }
  };

  // const handleOk = () => {
  //   setIsModalOpen(false);
  // };

  // const handleCancel = () => {
  //   setIsModalOpen(false);
  // };

  const categories: Category[] = [
  { value: 'all',       label: 'ทั้งหมด', colorClass: 'bg-gray-100 text-gray-800' },
  { value: 'general',   label: 'ประกาศทั่วไป', colorClass: 'bg-blue-100 text-blue-800' },
  { value: 'academic',  label: 'การเรียนการสอน', colorClass: 'bg-yellow-100 text-yellow-800' },
  { value: 'event',     label: 'กิจกรรม', colorClass: 'bg-purple-100 text-purple-800' },
  { value: 'urgent',    label: 'ด่วน', colorClass: 'bg-red-100 text-red-800' },
  { value: 'exam',      label: 'การสอบ', colorClass: 'bg-orange-100 text-orange-800' }
];

  
  const statuses = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'published', label: 'เผยแพร่แล้ว', color: 'text-green-600' },
    { value: 'draft', label: 'แบบร่าง', color: 'text-gray-600' }
  ];

  const columns: TableProps<AnnouncementInterface>['columns'] = [
    {
      title: 'ประกาศ',
      dataIndex: 'title',
      key: 'title',
      width: '40%',
      onHeaderCell: () => ({
          style: {
              fontSize:'18px'
          }
      }),
      // render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
      render:(text: string, record: AnnouncementInterface,) => {
        console.log(record.TargetGroupID);
        console.log(targetGroups);
        const group = targetGroups.find(g => g.id === record.TargetGroupID);
        // const admin = 
        return(
        <div style={{fontSize:'18px'}}>
          {/* หัวข้อ + ระดับ */}
          <div style={{ fontWeight: 'bold' }}>
            {text} 
            {/* <span style={{ color: record.level === 'สูง' ? 'red' : 'blue' }}>{record.level}</span> */}
          </div>

          {/* รายละเอียดย่อย */}
          <div style={{ fontSize: 16, color: '#888', marginTop: 4 }}>
            <div>{record.content}</div>
            <div>👥 {group?.group_name ?? '-'} </div>
            {/* <div>โดย {record.admin_id}</div> */}
          </div>
        </div>
      )},
    },
    {
      title: 'หมวดหมู่',
      dataIndex: 'category',
      key: 'category',
      width: '20%',
      onHeaderCell: () => ({
          style: {
              fontSize:'18px'
          }
      }),
      // render: (category: string) => {
      //   const categoryObj = categories.find(cat => cat.value === category);
      //   return categoryObj ? (
      //     <span className={`px-2 py-1 rounded ${categoryObj.color}`}>
      //       {categoryObj.label}
      //     </span>
      //   ) : (
      //     <span>{category}</span>
      //   );
      // }
      render: (categoryValue: string) => {
        const category = categories.find(cat => cat.value === categoryValue);
        return (
          <span className={`px-2 py-1 rounded ${category?.colorClass}`}
                style={{fontSize:'18px'}}>
            {category?.label ?? categoryValue}
          </span>
        );
      }
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      onHeaderCell: () => ({
          style: {
              fontSize:'18px'
          }
      }),
      render: (status: string) => {
        const statusObj = statuses.find(stat => stat.value === status);
        return statusObj ? (
          <span className={`px-2 py-1 rounded ${statusObj.color}`}
            style={{fontSize:'18px'}}>
            {statusObj.label}
          </span>
        ) : (
          <span style={{fontSize:'18px'}}>{status}</span>
      );}

    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'create_date',
      key: 'create_date',
      width: '15%',
      onHeaderCell: () => ({
          style: {
              fontSize:'18px'
          }
      }),
     render: (date: string, record: AnnouncementInterface) => {
    if (!date) return '-';

    // แปลงวัน
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const dayString = d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // แยกเวลา
    let time = record.time_create || '';
    if (time) {
      const t = time.split('T')[1];
      if (t) {
        const parts = t.split(':');
        const [hour, minute] = t.split(':'); // แยกชั่วโมง นาที
        time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    }
    }

    return (
      <span style={{ color: '#555', fontSize: '16px' }}>
        {dayString} {time ? ' ' + time : ''}
      </span>
    );
  }

    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      onHeaderCell: () => ({
          style: {
              fontSize:'18px'
          }
      }),
      render: (_, record) => (
        <Space size="middle">
          <Link to={`EditAnnouncement/${record.ID}`}>
            <Button icon={<FormOutlined />} style={{ color: "#42a5f5", borderColor: "#42a5f5" }} />
          </Link>
          <Button icon={<DeleteOutlined />} style={{ color: "#ff3d00", borderColor: "#ff3d00" }} 
          onClick={() => showDeleteModal(record)}/>
          
          {record.status === "ฉบับร่าง" && record.ID &&( //ปุ่มเผยแพร่
          <Button
          type="text"
          style={{color: "#3e8440"}}
          onClick={() => handlePublish(record.ID!)}
          >
          เผยแพร่
          </Button>
          )}
          
        </Space>
      ),
      width: 100,
      fixed: 'right',
    },
  ];

  <Table
    columns={columns}
    dataSource={announcements}
    rowKey="ID"
    loading={loading}
  />
  return (
    <div style = {{
      background:"#fff",
      minHeight:"100vh",
      marginLeft:"6px",
      marginRight:"6px",
      borderRadius:"6px",
      }}>
        {contextHolder}
      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="ลบ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: false }}>
          <p>คุณต้องการลบข้อมูลนี้หรือไม่?</p>
        </Modal>
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
                            {announcements.length} 
                            {/* นับจำนวนประกาศทั้งหมด */}
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
                            {announcements.filter(a => a.status === "เผยแพร่แล้ว").length} {/* ✅ filter นับเฉพาะเผยแพร่แล้ว */}
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
                            {announcements.filter(a => a.status === "ฉบับร่าง").length} {/* ✅ filter นับเฉพาะฉบับร่าง */}
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
          

          <Routes>
            <Route path='CreateAnnouncement' element={<CreateAnnouncement/>}/>
            <Route path='EditAnnouncement' element={<EditAnnouncement/>}/>
          </Routes>
          <Table<AnnouncementInterface> columns={columns} dataSource={announcements} rowKey= "ID" loading = {loading}
            style={{padding:'16px'}}/>
    </div>
  );
};




export default Announce;
