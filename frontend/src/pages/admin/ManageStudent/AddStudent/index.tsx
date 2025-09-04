import { Tabs } from "antd";
import type { TabsProps } from "antd";
import AddStudent from "../../../../components/Tabs/AddStudent";
import AddGuardian from "../../../../components/Tabs/AddGuardian";
import AddAddress from "../../../../components/Tabs/AddAddress";

export default function AddStudentPage() {
  const items: TabsProps["items"] = [
    { key: "student", label: "ข้อมูลทั่วไป", children: <AddStudent /> },
    { key: "guardian", label: "ข้อมูลผู้ปกครอง", children: <AddGuardian /> },
    { key: "address", label: "ที่อยู่", children: <AddAddress /> },
  ];

  return <Tabs defaultActiveKey="student" items={items} />;
}
