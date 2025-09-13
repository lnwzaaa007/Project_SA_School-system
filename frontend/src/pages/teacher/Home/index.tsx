import PictureSlide from '../../../components/PictureSlide'
import { Col,Row,Card,Statistic, Typography, Tag ,Modal, Space,Divider, Spin,Empty,List} from 'antd';
import type { AnnouncementInterface } from '../../../interfaces/announcement';
import { announcementAPI } from '../../../services/https';
import { useEffect, useState,useMemo } from 'react';
import type { ConstructionSharp } from '@mui/icons-material';

const {Text} = Typography;

const Home = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<AnnouncementInterface[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected , setSelected] = useState<AnnouncementInterface | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await announcementAPI.getAnnouncements();
        if (!mounted) return;
        setAnnouncements(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!mounted) return;
        setAnnouncements([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAnnouncements();
    return () => {
      mounted = false;
    };
  }, []);
  
  const teacherAnnouncements = useMemo(() => {
    const isStudentGroup = (name?: string) =>
    !!name && (name.includes("ครูและบุคลากร") || name.toLowerCase().includes("teacher") || name.includes("ทุกคน"));

    // helper: parse YYYY-MM-DD as local date (avoid UTC shift)
    const toLocalDate = (dateStr?: string) => {
      if (!dateStr) return undefined as Date | undefined;
      // รองรับทั้งรูปแบบ YYYY-MM-DD และ ISO เช่น YYYY-MM-DDTHH:mm:ssZ
      const onlyDate = dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr;
      const parts = onlyDate.split("-");
      if (parts.length !== 3) {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? undefined : d;
      }
      const [yStr, mStr, dStr] = parts;
      const y = Number(yStr);
      const m = Number(mStr);
      const d = Number(dStr);
      if (!y || !m || !d) return undefined;
      return new Date(y, m - 1, d);
    };

    // รวมวันที่ + เวลาเริ่ม (HH:mm) เป็น Date ใน timezone เครื่องผู้ใช้
    const toLocalDateTime = (dateStr?: string, timeStr?: string) => {
      const base = toLocalDate(dateStr);
      if (!base) return undefined as Date | undefined;
      if (!timeStr) return new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);
      // รองรับรูปแบบ "HH:mm" หรือ ISO ของเวลา
      const t = typeof timeStr === "string" ? timeStr : String(timeStr);
      const hhmm = t.includes("T") ? t.split("T")[1] : t;
      const [hh, mm] = (hhmm || "").split(":");
      const H = Number(hh);
      const M = Number(mm);
      return new Date(base.getFullYear(), base.getMonth(), base.getDate(), isNaN(H) ? 0 : H, isNaN(M) ? 0 : M, 0, 0);
    };

    // สถานะ Active: now อยู่ระหว่าง start <= now <= end (รวมทั้งวัน end)
    const isActiveNow = (a: AnnouncementInterface) => {
      const now = new Date();
      const start = toLocalDateTime(a.create_date, a.time_create);
      // end_date เก็บเป็นวันอย่างเดียว → ให้หมดอายุเวลา 23:59:59.999 ของวันนั้น
      const endDateOnly = toLocalDate(a.end_date);
      const end = endDateOnly
        ? new Date(endDateOnly.getFullYear(), endDateOnly.getMonth(), endDateOnly.getDate(), 23, 59, 59, 999)
        : undefined;

      // ถ้าไม่มี start ให้ถือว่าไม่พร้อมแสดง
      if (!start) return false;
      // ถ้าไม่มี end → แสดงตั้งแต่ start เป็นต้นไป
      if (!end) return now.getTime() >= start.getTime();
      return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
    };

    return (announcements || [])
      .filter((a) => (a.status === "เผยแพร่แล้ว" || a.status === "published"))
      .filter((a: any) => {
        const groupName = a?.target_group?.group_name || a?.group_name;
        return isStudentGroup(groupName);
      })
      // แสดงเฉพาะประกาศที่ยังไม่หมดอายุ (start <= now <= end)
      .filter((a) => isActiveNow(a))
      .sort((a, b) => {
        const sa = toLocalDateTime(a.create_date, a.time_create)?.getTime() ?? 0;
        const sb = toLocalDateTime(b.create_date, b.time_create)?.getTime() ?? 0;
        return sb - sa;
      });
  }, [announcements]);

  const categories = [
    { value: "general",  label: "ประกาศทั่วไป", color: "blue" },
    { value: "academic", label: "การเรียนการสอน", color: "gold" },
    { value: "event",    label: "กิจกรรม", color: "purple" },
    { value: "urgent",   label: "ด่วน", color: "red" },
    { value: "exam",     label: "การสอบ", color: "orange" },
  ];

  const getCategoryTag = (key?: string) => {
    if (!key) return null;
    const cat = categories.find((c) => c.value === key);
    if (!cat) return <Tag>{key}</Tag>;
    return (
      <Tag color={cat.color} style={{ marginLeft: 8 }}>
        {cat.label}
      </Tag>
    );
  };

  const openModal = (item: AnnouncementInterface) => {
    setSelected(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };
  return (
    <>
    <div
        style={{
          background:"#fff",
          height:"100%",
          borderRadius:"16px",
          margin: "-24px",
          padding: "0px",
          
        }}
        >
        <div className="home-page">
          <div style={{ margin: 0, padding: 0 ,borderRadius: "16px 16px 0px 0px", overflow: "hidden"}}>
            <PictureSlide />
          </div>


      {/* <Row gutter={16}>
        <Col span={12}>
        <h1
        style={{
          padding:'16px',
        }}>
          ประกาศข่าวสาร
          <Col span={12} xs={24} sm={24} md={24} lg={24} xl={24} style={{
            marginTop:'16px',
            background:'#d8efff',
            height:'100vh',
            borderRadius:"16px",

          }}>
          </Col>
        </h1>
        </Col>
        <Col span={12}>
        <h1 style = {{
          padding:'16px',
          color: '#383a66',
        }}>
          ปฏิทินการศึกษา 
          <div style = {{
            marginTop:'16px',
          }}>
          <Calendars/>
          </div>


        </h1>
        </Col>
      </Row>   */}

      {/* Add your schedule content here */}
      <Row gutter={16}>
        {/* <Col span={24} xs={24} sm={24} md={24} lg={12} xl={12}> */}
          <h1 style={{ padding: "16px",fontWeight:'normal',marginLeft:'16px' }}>ประกาศข่าวสาร</h1>
          <Col span={24} style={{ padding: "0 16px 16px" }}>
            <Card
              style={{
                background: "#d8efff",
                height: "100%",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                margin:'0 16px 0 16px',
              }}
              bodyStyle={{ height: "100%", padding: 16, display: "flex", flexDirection: "column" }}
            >
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                  <Spin />
                </div>
              ) : teacherAnnouncements.length === 0 ? (
                <Empty description="ยังไม่มีประกาศสำหรับนักเรียน" style={{ marginTop: 24 }} />
              ) : (
                <div style={{ overflowY: "auto" }}>
                  <List
                    itemLayout="vertical"
                    dataSource={teacherAnnouncements}
                    renderItem={(item) => {
                      const d = item.create_date ? new Date(item.create_date) : undefined;
                      const dayString = d
                        ? d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
                        : "";
                      const time = (item.time_create || "").slice(0, 5);
                      const groupName = (item as any)?.target_group?.group_name || (item as any)?.group_name;
                      return (
                        <List.Item style={{ padding: "10px 0" }}>
                          <div
                            role="button"
                            onClick={() => openModal(item)}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              padding: "8px 10px",
                              borderRadius: 8,
                              background: "#ffffffaa",
                              cursor: "pointer",
                              transition: "background 0.2s, box-shadow 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLDivElement).style.background = "#fff";
                              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.08)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLDivElement).style.background = "#ffffffaa";
                              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                            }}
                          >
                            <Space wrap align="center">
                              <Text strong style={{ fontSize: 16 }}>{item.title}</Text>
                              {getCategoryTag(item.category)}
                            </Space>

                            <Text
                              style={{
                                fontSize: 14,
                                whiteSpace: "pre-wrap",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical" as any,
                                overflow: "hidden",
                              }}
                            >
                              {item.content}
                            </Text>
                            {groupName && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                กลุ่มเป้าหมาย: {groupName}
                              </Text>
                            )}
                            
                            {(dayString || time) && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {dayString} {time ? `เวลา ${time} น.` : ""}
                              </Text>
                            )}
                            <div style={{ textAlign: "right" }}>
                              <Text underline style={{ color: "#1677ff" }}>ดูรายละเอียด</Text>
                            </div>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                </div>
              )}
            </Card>
          </Col>
        {/* </Col> */}

        {/* <Col span={12} xs={24} sm={24} md={24} lg={12} xl={12}>
          <h1 style={{ padding: "16px", color: "#383a66" ,fontWeight:'normal'}}>ปฏิทินการศึกษา</h1>
          <div style={{ marginTop: 16, padding: "0 16px 16px" }}>
            <Calendars />
          </div>
        </Col> */}
      </Row>

      {/* Modal: รายละเอียดประกาศ */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={closeModal}
        okText="ปิด"
        cancelButtonProps={{ style: { display: "none" } }}
        width={880}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
        title={<div style={{ fontSize: 22, fontWeight: 700 }}>{selected?.title || "รายละเอียดประกาศ"}</div>}
      >
        {selected && (
          <div>
            <Space align="center" wrap>
              {getCategoryTag(selected.category)}
              {((selected as any)?.target_group?.group_name || (selected as any)?.group_name) && (
                <Tag color="geekblue" style={{ fontSize: 14, padding: "2px 8px" }}>
                  {(selected as any)?.target_group?.group_name || (selected as any)?.group_name}
                </Tag>
              )}
            </Space>
            <Divider style={{ margin: "12px 0" }} />
            <div style={{ fontSize: 18, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{selected.content}</div>
            {(selected.create_date || selected.time_create) && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {selected.create_date
                    ? new Date(selected.create_date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""}
                  {selected.time_create ? ` เวลา ${(selected.time_create || "").slice(0, 5)} น.` : ""}
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>
        </div>
    </div>
   
    </>
  );
};
export default Home;
