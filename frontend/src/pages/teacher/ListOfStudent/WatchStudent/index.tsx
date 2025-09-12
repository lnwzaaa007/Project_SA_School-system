import { Tabs } from "antd";
import type { TabsProps } from "antd";
import WatchtStudent from "../../../../components/Tabs/WatchStudent";
import WatchGuardian from "../../../../components/Tabs/WatchGuardian";
import WatchAddress from "../../../../components/Tabs/WatchAddress";
import { StudentCreateProvider } from "../../../admin/ManageStudent/AddStudent/context";

export default function WatchStudent() {
  const items: TabsProps["items"] = [
    { key: "student",  label: "ข้อมูลทั่วไป",     children: <WatchtStudent /> },
    { key: "guardian", label: "ข้อมูลผู้ปกครอง", children: <WatchGuardian /> },
    { key: "address",  label: "ที่อยู่",          children: <WatchAddress /> },
  ];

  return (
    <StudentCreateProvider>
      <Tabs defaultActiveKey="student" items={items} />
    </StudentCreateProvider>
  );
}