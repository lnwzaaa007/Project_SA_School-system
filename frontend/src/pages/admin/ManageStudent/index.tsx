// pages/admin/ManageStudent/index.tsx
import "./index.css";
import React, { useEffect, useState } from "react";
import SelectGrade from "../../../components/SelectGrade";
import SelectClass from "../../../components/SelectClass";
import { SearchOutlined, PlusCircleOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Space, Table, Button, message, Popconfirm } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { studentCRUD } from "../../../services/https";
import { gradeCRUD } from "../../../services/https"; 

const { Column } = Table;



type DataType = {
  key: React.Key;
  ID: number;
  No: number;   
  StudentID: string;
  TitleTH: string;
  firstName: string;
  lastName: string;
  year?: string;
  class?: string;
};

const TITLE_MAP: Record<number, string> = {
  1: "นาย",
  2: "นางสาว",
  3: "นาง",
  4: "เด็กชาย",
  5: "เด็กหญิง",
  6: "-",
};

const ManageStudent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rows, setRows] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  type GradeMeta = { year: string; room: string }; // ไว้โชว์ในตาราง
  const [gradeMap, setGradeMap] = useState<Record<number, GradeMeta>>({});

useEffect(() => {
  (async () => {
    try {
      const res = await gradeCRUD.list();
      const list = res?.data?.data ?? res?.data ?? [];
      const map: Record<number, GradeMeta> = {};
      list.forEach((g: any) => {
        map[Number(g.id)] = {
          year: String(g.grade_year ?? ""),
          room: String(g.grade_class ?? ""),
        };
      });
      setGradeMap(map);
    } catch (e: any) {
      message.error(e?.message || "โหลดรายการชั้น/ห้องไม่สำเร็จ");
    }
  })();
}, []);

useEffect(() => {
  if (Object.keys(gradeMap).length > 0) {
    fetchList();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [gradeMap]);

const findGradeIdByYearRoom = (
  y: string | null,
  r: string | null
): number | undefined => {
  if (!y || !r) return undefined;
  const entry = Object.entries(gradeMap).find(
    ([, meta]) => String(meta.year) === String(y) && String(meta.room) === String(r)
  );
  return entry ? Number(entry[0]) : undefined;
};

  // message แบบเดียวกับตัวอย่าง Customers
  const [messageApi, contextHolder] = message.useMessage();

  // ฟิลเตอร์ (ยังคง UI เดิม)
  const [gradeYear, setGradeYear] = useState<string | null>(null);
  const [gradeClass, setGradeClass] = useState<string | null>(null); // ยังไม่ได้ใช้ที่ backend แต่เผื่ออนาคต
  const [keyword] = useState<string>(""); // ยังไม่มีช่อง search ก็ปล่อยว่างไปก่อน

  type FlashType = "success" | "error" | "info" | "warning" | "loading";

  useEffect(() => {
  const st = location.state as { flash?: { type?: FlashType; content?: string } } | null;

  if (st?.flash) {
    const t: FlashType = st.flash.type ?? "success";
    const content = st.flash.content ?? "บันทึกข้อมูลเรียบร้อย";

    message.open({ type: t, content }); // ✅ ไม่แดง
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [location.state, location.pathname, navigate]);

  const fetchList = async () => {
  setLoading(true);
  try {
    const gradeIdFilter = findGradeIdByYearRoom(gradeYear, gradeClass); // 🆕
    const res = await studentCRUD.list({
      q: keyword || undefined,
      grade_id: gradeIdFilter,   // 🆕 ส่งเฉพาะเมื่อเลือกครบ ชั้น+ห้อง
      page: 1,
      page_size: 1000,
    });

    const list = Array.isArray(res?.data) ? res.data : [];

    const mapped: DataType[] = list
      .map((it: any, idx: number) => {
        const meta = gradeMap[Number(it.grade_id)] || { year: "", room: "" };
        return {
          key: it.id,
          ID: it.id,
          No: idx + 1,               // 🆕 เลขที่ตามลำดับผลลัพธ์ที่แสดง
          StudentID: it.student_id,
          TitleTH: TITLE_MAP[it.title_id] || "-",
          firstName: it.t_first_name,
          lastName: it.t_last_name,
          year: meta.year,
          class: meta.room,
        };
      });

    setRows(mapped);
  } catch (e: any) {
    messageApi.open({
      type: "error",
      content: e?.message || "โหลดข้อมูลนักเรียนล้มเหลว",
    });
    setRows([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  if (Object.keys(gradeMap).length > 0) {
    fetchList();
  }
}, [gradeMap]);

  const onSearchClick = () => {
    fetchList();
  };


const onDelete = async (id: number) => {
  try {
    setLoading(true);
    const res = await studentCRUD.remove(id);

    // ถ้าผิดพลาด helper จะคืน error.response ซึ่งมี status
    if (res?.status && res.status >= 400) {
      if (res.status === 409) {
        messageApi.error("ลบไม่ได้: มีข้อมูลที่อ้างอิงอยู่ (foreign key)");
      } else {
        messageApi.error(res?.data?.error || "ลบไม่สำเร็จ");
      }
      return;
    }

    messageApi.success("ลบสำเร็จ");
    await fetchList(); // โหลดใหม่เพื่อรีเลขที่ (No) ให้เรียงต่อเนื่อง
  } catch (e: any) {
    messageApi.error(e?.message || "ลบไม่สำเร็จ");
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      {contextHolder}

      <div className="content1">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <SelectGrade value={gradeYear} onChange={(v: string) => setGradeYear(v)} />
          <SelectClass value={gradeClass} onChange={(v: string) => setGradeClass(v)} />
          <div
            className="miniIcon"
            onClick={onSearchClick}
            style={{ cursor: "pointer", padding: 6, borderRadius: 14, transition: "background-color 0.2s ease" }}
            title="ค้นหา"
          >
            <SearchOutlined style={{ fontSize: 18 }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Link to="AddStudent">
          <Button type="primary" icon={<PlusCircleOutlined />} className="myButton">
            เพิ่มข้อมูล
          </Button>
        </Link>
      </div>

      <div className="content2" style={{ width: "100%" }}>
        <Table<DataType>
          rowKey="ID"
          dataSource={rows}
          pagination={false}
          loading={loading}
          style={{ width: "100%", height: "100%" }}
        >
          <Column title="เลขที่" dataIndex="No" key="no" /> 
          <Column title="รหัสนักเรียน" dataIndex="StudentID" key="StudentID" />
          <Column title="คำนำหน้า" dataIndex="TitleTH" key="title_id" />
          <Column title="ชื่อ" dataIndex="firstName" key="t_first_name" />
          <Column title="นามสกุล" dataIndex="lastName" key="t_last_name" />
          <Column title="ชั้นปี" dataIndex="year" key="grade_year" />
          <Column title="ห้อง" dataIndex="class" key="grade_class" />
          <Column
            title=""
            key="action"
            render={(record: DataType) => (
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/admin/manageStudent/EditStudent/${record.ID}`)}
                  style={{ marginRight: 20, backgroundColor: "#fff", color: "#005e98ff", border: "1px solid #ccc" }}
                >
                  แก้ไขข้อมูล
                </Button>

               <Popconfirm
  title="ลบนักเรียนคนนี้?"
  description="การลบจะไม่สามารถย้อนกลับได้"
  okText="ลบ"
  cancelText="ยกเลิก"
  okButtonProps={{ danger: true }}
  onConfirm={() => onDelete(record.ID)}
>
  <Button type="dashed" danger icon={<DeleteOutlined />} />
</Popconfirm>
              </Space>
            )}
          />
        </Table>
      </div>
    </div>
  );
};

export default ManageStudent;
