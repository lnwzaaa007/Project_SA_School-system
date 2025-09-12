import { Tabs } from "antd";
import type { TabsProps } from "antd";
import EditStudent from "../../../../components/Tabs/EditStudent";
import EditGuardian from "../../../../components/Tabs/EditGuardian";
import EditAddress from "../../../../components/Tabs/EditAddress";
import { StudentCreateProvider } from "../AddStudent/context";

export default function AddStudentPage() {
  const items: TabsProps["items"] = [
    { key: "student",  label: "ข้อมูลทั่วไป",     children: <EditStudent /> },
    { key: "guardian", label: "ข้อมูลผู้ปกครอง", children: <EditGuardian /> },
    { key: "address",  label: "ที่อยู่",          children: <EditAddress /> },
  ];

  return (
    <StudentCreateProvider>
      <Tabs defaultActiveKey="student" items={items} />
    </StudentCreateProvider>
  );
}