import React ,{useState} from 'react';
import {Link} from 'react-router-dom';
import { Button, Col, Row, Modal, message, Popconfirm, Switch} from 'antd';
import './messageConfig.css'
message.config({
  top: 0,
   // ปรับค่าตามต้องการ
});
import { Space, Table, Tag, Form } from 'antd';
import type { TableProps } from 'antd';
import {FormOutlined,
        DeleteOutlined,  
} from '@ant-design/icons';

interface DataType {
  key: string;
  courseid: string; //รหัสวิชา
  name: string; //ชื่อวิชา
  teachername: string; //ครูผู้สอน
  creditnum: number; //จำนวนหน่วยกิต
  grade: string//ชั้น
  class: number//ห้อง
  classinweek: number//จำนวนตาบ
  groupsubject: string//กลุ่มสาระ
//   tags: string[];

}
const CourseTable: React.FC = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState<any>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const showDeleteModal = (record: any) => {
    setDeleteRecord(record);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOk = () => {
    // ใส่ฟังก์ชันลบข้อมูลที่นี่ เช่น ลบ deleteRecord ออกจาก data
    setIsDeleteModalOpen(false);
    setDeleteRecord(null);
    // setShowDeleteSuccess(true);
    message.success({content:"ลบสำเร็จ",  duration: 2 ,});
    console.log("ลบสำเร็จ"); // เพิ่มบรรทัดนี้
    console.log("setShowDeleteSuccess true");
    
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeleteRecord(null);

  };
  

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'ลำดับที่',
      dataIndex: 'key',
      key: 'key',
      width: 100,
      onHeaderCell: () => ({
          style: {
              background:"#42a5f5",
              
          }
      }), 
    }, 
    {
      title: 'รหัสวิชา',
      dataIndex: 'courseid',
      key: 'courseid',
      width: 200,
      onHeaderCell: () => ({
          style: {
              background:"#42a5f5"
          }
      }),   
    },
    {
      title: 'ชื่อวิชา',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      onHeaderCell: () => ({
          style: {
              background:"#42a5f5"
          }
      })
    
    },
    {
      title: 'ครูผู้สอน',
      dataIndex: 'teachername',
      key: 'teachername',
      width: 180,
      onHeaderCell: () => ({
          style: {
              background:"#42a5f5"
          }
      })
    },
  //   {
  //     title: 'จำนวนหน่วยกิต',
  //     key: 'tags',
  //     dataIndex: 'tags',
  //     render: (_, { tags }) => (
  //       <>
  //         {tags.map((tag) => {
  //           let color = tag.length > 5 ? 'geekblue' : 'green';
  //           if (tag === 'loser') {
  //             color = 'volcano';
  //           }
  //           return (
  //             <Tag color={color} key={tag}>
  //               {tag.toUpperCase()}
  //             </Tag>
  //           );
  //         })}
  //       </>
  //     ),
  //   },
  //   {
  //     title: 'Action',
  //     key: 'action',
  //     render: (_, record) => (
  //       <Space size="middle">
  //         <a>Invite {record.name}</a>
  //         <a>Delete</a>
  //       </Space>
  //     ),
  //   },
    {
      title: 'จำนวนหน่วยกิต',
      dataIndex: 'creditnum',
      key: 'creditnum',
      width: 150,
      onHeaderCell: () => ({
          style: {
              background:"#42a5f5"
          }
      })
    },
    {
      title: 'ระดับชั้น',
      dataIndex: 'grade',
      key: 'grade',
      width: 130,
      onHeaderCell: () => ({
          style: {
              background:"#42a5f5"
          }
      })
    },
    {
      title: 'ห้อง',
      dataIndex: 'class',
      key: 'class',
      width: 100,
      onHeaderCell: () => ({
          style: {
              background:"#42a5f5"
          }
      })
    },
    {
      title: 'จำนวนคาบ/สัปดาห์',
      dataIndex: 'classinweek',
      key: 'classinweek',
      width: 180,
      onHeaderCell: () => ({
          style: {
              background:"#42a5f5"
          }
      })
      
    },
    {
      title: 'กลุ่มสาระ',
      dataIndex: 'groupsubject',
      key: 'groupsubject',
      onHeaderCell: () => ({
          style: {
              background:"#42a5f5"
          }
      })
    },
    {
      title: '',
      key: 'action',
      onHeaderCell: () => ({
          style: {
              background:"#42a5f5"
          }
      }),
      render: (_, record) => (
        <Link to ='EditCourse'>
          <Button
                icon = {<FormOutlined/>}
                //type = 'primary'
                // style = {{borderColor:"#ffca00",
                //           color:"#ffca00",
                        
                // }}
                style = {{color:"#3a83f3",
                        borderColor:"#3a83f3",
                        background:"#fff",
                }}
                >
                  แก้ไข
          </Button>
        </Link>
        
      ),
    },
    {
      title: '',
      key: 'action',
      onHeaderCell: () => ({
          style: {
              background:"#42a5f5"
          }
      }),
      render: (_, record) => (
        // <Link to ='DeleteCourse'>
          <Button
                icon = {<DeleteOutlined/>}
                // type = 'primary'
                style = {{color:"#ff1818",
                        borderColor:"#ff1818",
                }}
                onClick={() => showDeleteModal(record)}
                >
                  
          </Button>
          // </Link>
      ),    
    },
  ];

  const data: DataType[] = [
    {
      key: '1',
      courseid: 'ENG23 ',
      name: 'science',
      teachername: 'Pensri',
      creditnum: 1,
      grade: 'ม.1',//ชั้น
      class: 1,//ห้อง
      classinweek: 3,//จำนวนตาบ
      groupsubject: "ภาษาไทย",//กลุ่มสาระ
      
    },
    {
      key: '2',
      courseid: 'ค31102',
      name: 'คณิตศาสตร์ 2',
      teachername: 'สมชาย ใจดี',
      creditnum: 1.5,
      grade: 'ม.2',//ชั้น
      class: 2,//ห้อง
      classinweek: 3,//จำนวนตาบ
      groupsubject: "กลุ่มสาระคณิตศาสตร์",//กลุ่มสาระ
    },
  //   {
  //     key: '2',
  //     courseid: 'ENG23 ',
  //     name: 'math',
  //     teachername: 'yuio',
  //     creditnum: 1,
      
  //   },
  //   {
  //     key: '3',
  //     courseid: 'ENG23 ',
  //     name: 'English',
  //     teachername: 'lkjh',
  //     creditnum: 2,
      
  //   },
  ];


  return(
    <>
    <Table<DataType> columns={columns} dataSource={data}  />
    <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="ลบ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: false }}
        // afterClose={() => {
        // if (showDeleteSuccess) {
        //   message.success({content:"ลบสำเร็จ", duration: 2 });
        //   setShowDeleteSuccess(false);
        // }
      // }}
      >
        <p>คุณต้องการลบข้อมูลนี้หรือไม่?</p>
        
    </Modal>
    
    
    </>
  )
};

export default CourseTable;