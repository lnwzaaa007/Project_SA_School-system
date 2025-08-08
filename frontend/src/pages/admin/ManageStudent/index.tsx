import './index.css';
import React, { useState } from 'react';
import SelectGrade from '../../../components/SelectGrade';
import SelectClass from '../../../components/SelectClass';
import { SearchOutlined, DownOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Form, Radio, Space, Switch, Table, Tag, Button } from 'antd';
import type {
  GetProp,
  RadioChangeEvent,
  TableProps,
} from 'antd';

import { Link, Route, useNavigate,Outlet } from "react-router-dom";


const { Column, ColumnGroup } = Table;

type SizeType = TableProps['size'];
// type TablePagination<T extends object> = NonNullable<Exclude<TableProps<T>['pagination'], boolean>>;
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
            gap: '5px',
            alignItems: 'center',
          }}
        >
          <SelectGrade />
          <SelectClass />
          <div
            className="miniIcon"
            onClick={() => console.log('ค้นหา...')}
            style={{
              cursor: 'pointer',
              marginLeft: '8px',
              padding: '6px',
              borderRadius: '14px',
              transition: 'background-color 0.2s ease',
            }}
          >
            <SearchOutlined style={{ fontSize: 18 }} />
          </div>
        </div>
      </div>

      <div className="content2" style={{ width: '%'}}>
         <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Link to ="AddStudent">
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            style={{
              backgroundColor: '#9cc3ffff', // สีเขียว
              borderColor: '#9cc3ffff',
              fontWeight: 'bold',
              borderRadius: '8px',
              padding: '0 16px',
              height: '40px',
            }}
          >
            เพิ่มข้อมูล
          </Button>
          </Link>
        </div>
        <Table<DataType>
          dataSource={data}
          pagination={false}
          style={{ width: '100%',height:'100%' }}
        >
          <Column title="No." dataIndex="key" key="key" />
          <Column title="StudentID" dataIndex="StudentID" key="StudentID" />
          <Column title="TitleTH" dataIndex="TitleTH" key="TitleTH" />
          <ColumnGroup title="Name">
            <Column title="First Name" dataIndex="firstName" key="firstName" />
            <Column title="Last Name" dataIndex="lastName" key="lastName" />
          </ColumnGroup>
          {/* <Column
            title="Tags"
            dataIndex="tags"
            key="tags"
            render={(tags: string[]) => (
              <>
                {tags.map((tag) => {
                  let color = tag.length > 5 ? 'geekblue' : 'green';
                  if (tag === 'loser') {
                    color = 'volcano';
                  }
                  return (
                    <Tag color={color} key={tag}>
                      {tag.toUpperCase()}
                    </Tag>
                  );
                })}
              </>
            )}
          /> */}
          <Column
            title="Action"
            key="action"
            render={(_: any, record: DataType) => (
              <Space size="middle">
                <a>See</a>
                <a>Edit</a>
                <a>Delete</a>
              </Space>
            )}
          />
        </Table>
      </div>
    </div>
  );
};

export default ManageStudent;
