import React from 'react';
import { Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';

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

const columns: TableProps<DataType>['columns'] = [
  {
    title: 'ลำดับที่',
    dataIndex: 'key',
    key: 'key',
    
    width: 100
  }, 
  {
    title: 'รหัสวิชา',
    dataIndex: 'courseid',
    key: 'courseid',
    
    width: 200   
  },
  {
    title: 'ชื่อวิชา',
    dataIndex: 'name',
    key: 'name',
    width: 180,
    
   
  },
  {
    title: 'ครูผู้สอน',
    dataIndex: 'teachername',
    key: 'teachername',
    width: 200,
    
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
    width: 180,
    
  },
  {
    title: 'ระดับชั้น',
    dataIndex: 'grade',
    key: 'grade',
    width: 150,
    
  },
  {
    title: 'ห้อง',
    dataIndex: 'class',
    key: 'class',
    width: 100,
    
  },
  {
    title: 'จำนวนคาบ/สัปดาห์',
    dataIndex: 'classinweek',
    key: 'classinweek',
    width: 180,
    
    
  },
  {
    title: 'กลุ่มสาระ',
    dataIndex: 'groupsubject',
    key: 'groupsubject',
    
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

const CourseTable: React.FC = () => <Table<DataType> columns={columns} dataSource={data} />;

export default CourseTable;