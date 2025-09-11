import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
import { HomeOutlined, SolutionOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { studentCRUD, guardianCRUD } from "../../../services/https";

const StudentProfile = () => {
  const { id } = useParams<{ id?: string }>();
  const studentId = id ? Number(id) : undefined;

  // toggle เดิม
  const [showPersonal, setShowPersonal] = useState(true);
  const [showFather, setShowFather] = useState(true);
  const [showMother, setShowMother] = useState(true);

  // state ใหม่สำหรับข้อมูลจริง
  const [student, setStudent] = useState<any>(null);
  const [father, setFather] = useState<any>(null);
  const [mother, setMother] = useState<any>(null);

  // ---------- helpers ----------
  const show = (v: any) => (v == null || String(v).trim() === "" ? "-" : String(v).trim());

  const fullNameTH = (p?: any) =>
    [p?.t_first_name ?? p?.first_name, p?.t_last_name ?? p?.last_name].filter(Boolean).join(" ").trim() || "-";

  const fullNameEN = (p?: any) =>
    [p?.e_first_name ?? p?.first_name_en, p?.e_last_name ?? p?.last_name_en].filter(Boolean).join(" ").trim() || "-";

  const mapGenderTH = (g?: string) => {
    const x = (g ?? "").toLowerCase();
    if (x === "male" || x === "ชาย") return "ชาย";
    if (x === "female" || x === "หญิง") return "หญิง";
    return "-";
  };

  const fmtTel = (s?: string) => {
    const d = (s ?? "").replace(/\D/g, "");
    if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    return d || "-";
  };

  const fmtThaiDate = (iso?: string) => {
    if (!iso) return "-";
    const d = dayjs(iso);
    if (!d.isValid()) return "-";
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const dd = d.date();
    const mm = months[d.month()];
    const yyyy = d.year() + 543;
    return `${dd} ${mm} ${yyyy}`;
  };

  // normalize โครง guardian ให้เหลือคีย์ที่เราต้องการ
  const normPerson = (x: any) =>
    !x
      ? null
      : {
          citizen_id: x.citizen_id ?? x.id_card ?? "",
          first_name: x.first_name ?? x.fnameTH ?? "",
          last_name: x.last_name ?? x.lnameTH ?? "",
          tel: x.tel ?? x.phone ?? "",
          job: x.job ?? "",
          dob: x.dob ?? x.date_of_birth ?? "",
          status: x.status ?? "",
          relation: x.relation ?? x.relationship ?? x.role ?? "",
        };

  useEffect(() => {
    if (!studentId) return;

    (async () => {
      try {
        // 1) ดึงข้อมูลนักเรียน
        const sRes = await studentCRUD.getById(studentId);
        const s = sRes?.data?.data ?? sRes?.data ?? null;
        setStudent(s);

        // 2) ดึงผู้ปกครอง
        const gRes = await guardianCRUD.listByStudent(studentId);
        const raw = gRes?.data?.data ?? gRes?.data ?? null;

        let f = null,
          m = null;

        if (Array.isArray(raw)) {
          // กรณีเป็นลิสต์: [{relation:'father'|'mother'|... , ...}, ...]
          const pick = (needle: string) =>
            raw.find((r: any) =>
              String(r?.relation ?? r?.relationship ?? r?.role ?? "")
                .toLowerCase()
                .includes(needle)
            );
          f = normPerson(pick("father") || pick("บิดา"));
          m = normPerson(pick("mother") || pick("มารดา"));
        } else if (raw && typeof raw === "object") {
          // กรณีเป็นออบเจ็กต์: { father:{...}, mother:{...} }
          f = normPerson(raw.father);
          m = normPerson(raw.mother);
        }

        setFather(f);
        setMother(m);
      } catch (e) {
        // เงียบไว้เพื่อไม่ให้กระทบหน้าโชว์
        console.error(e);
      }
    })();
  }, [studentId]);

  return (
    <>
      {
        <div className="container">
          <div className="main"></div>

          <div className="content1">
            <div className="content1Show">
              <div className="content1ShowP"></div>
              <div className="content1ShowInfor">{fullNameTH(student)}</div>
            </div>
          </div>

          <div className="content2">
            <div className="content2Left">
              <div className="content2LeftFun">
                <div className="content2Left-Item1">
                  <div className="content2Left-ItemInner">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <SolutionOutlined style={{ fontSize: 24 }} />
                      </div>
                      <span className="menu-label" style={{ paddingLeft: 16, fontSize: 15 }}>
                        ข้อมูลทั่วไป
                      </span>
                    </div>
                  </div>
                </div>

                <div className="content2Left-Item">
                  <a href="../src/HistoryAddressS.tsx"></a>
                  <div className="content2Left-ItemInner">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <HomeOutlined style={{ fontSize: 24 }} />
                      </div>
                      <span style={{ paddingLeft: "16px", fontSize: "15px" }}>ที่อยู่</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="content2Right">
              {/* ส่วนบุคคล */}
              <div className="content2RightFun">
                <div className="cursor">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div>ข้อมูลส่วนบุคคล</div>
                    <button onClick={() => setShowPersonal(!showPersonal)}>
                      {showPersonal ? <UpOutlined /> : <DownOutlined />}
                    </button>
                  </div>
                </div>

                {showPersonal && (
                  <div>
                    <div className="flex-content">
                      <div className="student-sub-title">บัตรประจำตัวประชาชน</div>
                      <div className="student-sub-detail">{show(student?.citizen_id)}</div>
                    </div>

                    <div className="flex-content">
                      <div className="student-sub-title">ชื่อ-นามสกุล (TH)</div>
                      <div className="student-sub-detail">{fullNameTH(student)}</div>
                    </div>

                    <div className="flex-content">
                      <div className="student-sub-title">ชื่อ-นามสกุล (EN)</div>
                      <div className="student-sub-detail">{fullNameEN(student)}</div>
                    </div>

                    <div className="flex-content">
                      <div className="student-sub-title">เพศ</div>
                      <div className="student-sub-detail">{mapGenderTH(student?.gender)}</div>
                    </div>

                    <div className="flex-content">
                      <div className="student-sub-title">วันเกิด</div>
                      <div className="student-sub-detail">{fmtThaiDate(student?.date_of_birth)}</div>
                    </div>

                    <div className="flex-content">
                      <div className="student-sub-title">สัญชาติ</div>
                      <div className="student-sub-detail">{show(student?.nationality)}</div>
                    </div>

                    <div className="flex-content">
                      <div className="student-sub-title">ศาสนา</div>
                      <div className="student-sub-detail">{show(student?.religious)}</div>
                    </div>

                    <div className="flex-content">
                      <div className="student-sub-title">เบอร์โทรศัพท์ติดต่อ</div>
                      <div className="student-sub-detail">{fmtTel(student?.tel)}</div>
                    </div>

                    <div className="flex-content">
                      <div className="student-sub-title">E-mail</div>
                      <div className="student-sub-detail">{show(student?.email)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* ข้อมูลบิดา */}
              <div className="content2RightFun">
                <div className="cursor">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div>ข้อมูลบิดา</div>
                    <button onClick={() => setShowFather(!showFather)}>{showFather ? <UpOutlined /> : <DownOutlined />}</button>
                  </div>
                </div>

                {showFather && (
                  <div>
                    <div className="flex-content">
                      <div className="student-sub-title">บัตรประจำตัวประชาชน</div>
                      <div className="student-sub-detail">{show(father?.citizen_id)}</div>
                    </div>
                    <div className="flex-content">
                      <div className="student-sub-title">ชื่อ-นามสกุล (TH)</div>
                      <div className="student-sub-detail">{[father?.first_name, father?.last_name].filter(Boolean).join(" ") || "-"}</div>
                    </div>
                    <div className="flex-content">
                      <div className="student-sub-title">เบอร์โทรศัพท์ติดต่อ</div>
                      <div className="student-sub-detail">{fmtTel(father?.tel)}</div>
                    </div>
                    <div className="flex-content">
                      <div className="student-sub-title">วันเกิด</div>
                      <div className="student-sub-detail">{fmtThaiDate(father?.dob)}</div>
                    </div>
                    <div className="flex-content">
                      <div className="student-sub-title">อาชีพ</div>
                      <div className="student-sub-detail">{show(father?.job)}</div>
                    </div>
                    <div className="flex-content">
                      <div className="student-sub-title">สถานะ</div>
                      <div className="student-sub-detail">{show(father?.status)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* ข้อมูลมารดา */}
              <div className="content2RightFun">
                <div className="cursor">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div>ข้อมูลมารดา</div>
                    <button onClick={() => setShowMother(!showMother)}>{showMother ? <UpOutlined /> : <DownOutlined />}</button>
                  </div>
                </div>

                {showMother && (
                  <div>
                    <div className="flex-content">
                      <div className="student-sub-title">บัตรประจำตัวประชาชน</div>
                      <div className="student-sub-detail">{show(mother?.citizen_id)}</div>
                    </div>
                    <div className="flex-content">
                      <div className="student-sub-title">ชื่อ-นามสกุล (TH)</div>
                      <div className="student-sub-detail">{[mother?.first_name, mother?.last_name].filter(Boolean).join(" ") || "-"}</div>
                    </div>
                    <div className="flex-content">
                      <div className="student-sub-title">เบอร์โทรศัพท์ติดต่อ</div>
                      <div className="student-sub-detail">{fmtTel(mother?.tel)}</div>
                    </div>
                    <div className="flex-content">
                      <div className="student-sub-title">วันเกิด</div>
                      <div className="student-sub-detail">{fmtThaiDate(mother?.dob)}</div>
                    </div>
                    <div className="flex-content">
                      <div className="student-sub-title">อาชีพ</div>
                      <div className="student-sub-detail">{show(mother?.job)}</div>
                    </div>
                    <div className="flex-content">
                      <div className="student-sub-title">สถานะ</div>
                      <div className="student-sub-detail">{show(mother?.status)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      }
    </>
  );
};

export default StudentProfile;
