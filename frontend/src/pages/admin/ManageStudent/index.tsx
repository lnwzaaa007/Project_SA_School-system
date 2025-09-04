import './index.css';
import React, { useState } from 'react';
import SelectGrade from '../../../components/SelectGrade';
import SelectClass from '../../../components/SelectClass';
import { SearchOutlined, PlusCircleOutlined, DeleteOutlined,EditOutlined } from '@ant-design/icons';
import { Space, Table, Button } from 'antd';
import type {
  TableProps,
} from 'antd';

import { Link, Route, useNavigate,Outlet, Routes } from "react-router-dom";
import AddStudent from './AddStudent';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Column } = Table;

type SizeType = TableProps['size'];
type TablePagination<T extends object> = NonNullable<Exclude<TableProps<T>['pagination'], boolean>>;
type TablePaginationPosition = NonNullable<TablePagination<any>['position']>[number];

type DataType = {
  key: React.Key;
  TitleTH:string;
  firstName: string;
  lastName: string;
  StudentID: string;

};

const data: DataType[] = [
  {
    key: '1',
    TitleTH:'Miss',
    firstName: 'John',
    lastName: 'Brown',
    StudentID: 'B0001',


  },
  {
    key: '2',
    TitleTH:'Mr.',
    firstName: 'Jim',
    lastName: 'Green',
    StudentID: 'B0002',

  },
  {
    key: '3',
    TitleTH:'Mr.',
    firstName: 'Joe',
    lastName: 'Black',
    StudentID: 'B0003',

  },
];

const ManageStudent: React.FC = () => {
  return (
    <div>
      <div className="content1">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <SelectGrade value={null} onChange={function (value: string): void {
            throw new Error('Function not implemented.');
          } }/>
          <SelectClass value={null} onChange={function (value: string): void {
            throw new Error('Function not implemented.');
          } }/>
          <div
            className="miniIcon"
            onClick={() => console.log('ค้นหา...')}
            style={{
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '14px',
              transition: 'background-color 0.2s ease',
            }}
          >
            <SearchOutlined style={{ fontSize: 18 }} />
          </div>
        </div>
      </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Link to ="AddStudent">
            <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            className="myButton"
            >
              เพิ่มข้อมูล
            </Button>
          </Link>
        </div>
      <div className="content2" style={{ width: '%'}}>
        <Table<DataType>
          dataSource={data}
          pagination={false}
          style={{ width: '100%',height:'100%' }}
        >
          <Column title="เลขที่" dataIndex="ID" key="id" />
          <Column title="รหัสนักเรียน" dataIndex="StudentID" key="StudentID" />
          <Column title="คำนำหน้า" dataIndex="TitleTH" key="title_id" />
          <Column title="ชื่อ" dataIndex="firstName" key="t_first_name" />
          <Column title="นามสกุล" dataIndex="lastName" key="t_last_name" />
          <Column title="ชั้นปี" dataIndex="year" key="glade_year" />
          <Column title="ห้อง" dataIndex="class" key="grade_class" />
          <Column
            title=""
            key="action"
            render={(record) => (
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<EditOutlined/>}
                  onClick={() => navigate(`/ManageStudent/EditStudent/${record.ID}`)}
                  style={{ marginRight: "20px", backgroundColor: '#ffffffff', color:'#005e98ff', border:'1px solid #ccc' }}
                >
                  แก้ไขข้อมูล
                </Button>
                  {/* {myId == record?.ID ? (
                    <></>
                  ) : ( */}
                    <Button
                      type="dashed"
                      danger
                      icon={<DeleteOutlined />}
                      // onClick={() => deleteUserById(record.ID)}
                    ></Button>
                  {/* )} */}
              </Space>
            )}
          />
        </Table>

      </div>

    </div>
  );
};

export default ManageStudent;