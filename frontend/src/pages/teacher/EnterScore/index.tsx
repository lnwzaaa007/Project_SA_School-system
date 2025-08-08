import React from 'react';
import { Table, Input, Button, Select, Space } from 'antd';
import { SearchOutlined, EditOutlined } from '@ant-design/icons';
import SelectGrade from '../../../components/SelectGrade';
import SelectClass from '../../../components/SelectClass';

const EnterScore = () => {
const { Option } = Select;

const columns = [
  {
    title: 'ที่',
    dataIndex: 'no',
    width: 50,
    align: 'center',
  },
  {
    title: 'รหัส',
    dataIndex: 'id',
    width: 100,
    align: 'center',
    render: () => <Input size="small" disabled />,
  },
  {
    title: 'ชื่อ - นามสกุล',
    dataIndex: 'name',
    width: 200,
    render: () => <Input size="small" disabled />,
  },
  {
    title: 'คะแนนเก็บ',
    dataIndex: 'collect',
    width: 100,
    render: () => <Input size="small" />,
  },
  {
    title: 'จิตพิสัย',
    dataIndex: 'behavior',
    width: 100,
    render: () => <Input size="small" />,
  },
  {
    title: 'คะแนนกลางภาค',
    dataIndex: 'midterm',
    width: 130,
    render: () => <Input size="small" />,
  },
  {
    title: 'คะแนนปลายภาค',
    dataIndex: 'final',
    width: 130,
    render: () => <Input size="small" />,
  },
  {
    title: 'รวมคะแนน 100',
    dataIndex: 'total',
    width: 130,
    render: () => <Input size="small"  />,
  },
  {
    title: 'เกรด',
    dataIndex: 'grade',
    width: 100,
    render: () => <Input size="small" disabled />,
  },
];

const data = Array.from({ length: 15 }, (_, i) => ({
  key: i,
  no: i + 1,
}));

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input placeholder="วิชา" style={{ width: 200 }} />
        <Input placeholder="อาจารย์ผู้สอน" style={{ width: 200 }} />
        <SelectGrade />
        <SelectClass />
        <Button icon={<SearchOutlined />} />
        <div style={{ marginLeft: 'auto' }}>
          <Button icon={<EditOutlined />} style={{ marginRight: 8 }} />
          <Button type="primary">บันทึก</Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="middle"
        />
      </div>
  );
};
export default EnterScore;