import React from 'react';
import { Table, Button } from 'antd';
import type { TableColumnsType } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined   } from '@ant-design/icons';
import { Link, Route, useNavigate,Outlet } from "react-router-dom";


interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const columns: TableColumnsType<DataType> = [
  {
    title: 'Full Name',
    width: 100,
    dataIndex: 'name',
    fixed: 'left',
  },
  {
    title: 'Age',
    width: 100,
    dataIndex: 'age',
  },
  { title: 'Adress', dataIndex: 'address', key: '1', fixed: 'left' },
  // ... (column อื่น ๆ)
  {
    title: 'ยืนยัน',
    fixed: 'right',
    width: 90,
    render: (_, record) => (
    <Button onClick={() => alert(`ยืนยันข้อมูล ${record.name}`)} icon={<CheckOutlined />}>
      
    </Button>
    
  ),
  },
  {
    title: 'ลบ',
    fixed: 'right',
    width: 90,
    render: (_, record) => (
    <Button onClick={() => alert(`ลบข้อมูล ${record.name}`)} icon={<CloseOutlined />}>
      
    </Button>
  ),
  },
   {
    title: 'แสดง',
    fixed: 'right',
    width: 90,
    render: (_, record) => (
        <Link to ="/admin/applyForStudy/MoveAddStudent">
    <Button  icon={<EyeOutlined />}>
      
    </Button>
    </Link>
  ),
  },
];

const dataSource: DataType[] = [
  { key: '1', name: 'มานะ มีชัย', age: 14, address: 'กรุงเทพมหานคร' },
  { key: '2', name: 'สมใจ มั่งมี', age: 15, address: 'นครราชสีมา' },
];

const TableApplyForStudy: React.FC = () => {
  return (
    <Table<DataType>
      bordered
      className="custom-scroll-table"
      columns={columns}
      dataSource={dataSource}
      scroll={{ x: 'max-content' }}
      pagination={false}
    />
  );
};

export default TableApplyForStudy;
