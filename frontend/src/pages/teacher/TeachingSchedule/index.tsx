import React, { useState } from "react";
import { Button, Table, Card } from "antd";
// import { PlusOutlined, DeleteOutlined, FormOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface Course {
  id: string;
  code: string;
  name: string;
  // เพิ่ม fields อื่น ๆ ได้ตามต้องการ
}

interface TimeTableRow {
  key: string;
  day: string;
  time1?: string;
  time2?: string;
  time3?: string;
  time4?: string;
  time5?: string;
  time6?: string;
  time7?: string;
  time8?: string;
  time9?: string;
}

const initialTimeTableData: TimeTableRow[] = [
  { key: "1", day: "จันทร์" },
  { key: "2", day: "อังคาร" },
  { key: "3", day: "พุธ" },
  { key: "4", day: "พฤหัส" },
  { key: "5", day: "ศุกร์" },
];

const timeTableColumns: ColumnsType<TimeTableRow> = [
  {
    title: "Day/Time",
    dataIndex: "day",
    key: "day",
    align: "center",
  },
  {
    title: "08.40-09.30",
    dataIndex: "time1",
    key: "time1",
    align: "center",
  },
  {
    title: "09.30-10.20",
    dataIndex: "time2",
    key: "time2",
    align: "center",
  },
  {
    title: "10.20-11.10",
    dataIndex: "time3",
    key: "time3",
    align: "center",
  },
  {
    title: "11.10-12.00",
    dataIndex: "time4",
    key: "time4",
    align: "center",
  },
  {
    title: "12.00-13.00",
    dataIndex: "time5",
    key: "time5",
    align: "center",
    render: (_, __, index) => {
      if (index === 0) {
        return {
          children: "พักเที่ยง",
          props: { rowSpan: 5 },
        };
      }
      return {
        children: null,
        props: { rowSpan: 0 },
      };
    },
  },
  {
    title: "13.00-13.50",
    dataIndex: "time6",
    key: "time6",
    align: "center",
  },
  {
    title: "13.50-14.40",
    dataIndex: "time7",
    key: "time7",
    align: "center",
  },
  {
    title: "14.40-15.30",
    dataIndex: "time8",
    key: "time8",
    align: "center",
  },
  {
    title: "15.30-16.30",
    dataIndex: "time9",
    key: "time9",
    align: "center",
  },
];

const TeacherSchedule: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        // padding: "50px 80px",
        // background: "#F1EEE0",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        style={{ width: "100%", border: "none", boxShadow: "none" }}
        bodyStyle={{ padding: "40px" }}
      >
        {/* Filter Section */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "5px",
            marginBottom: "42px",
            alignItems: "center",
          }}
        >
          
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 12,
            }}
          >
          </div>
        </div>

        {/* ตารางเวลา */}
        <div style={{ overflowX: "auto",paddingTop:"40px" }}>
          <Table
            dataSource={initialTimeTableData}
            columns={timeTableColumns}
            pagination={false}
            bordered
            style={{ minWidth: 1200 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default TeacherSchedule;