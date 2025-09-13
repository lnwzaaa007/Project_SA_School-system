// components/Tabs/AddGuardian/index.tsx
import React, { useState } from "react";
import {
  Form, Input, Select, DatePicker, Button, Space, Upload,
  Row, Col, Radio, Typography, message
} from "antd";
import dayjs from "dayjs";

// import { guardianCRUD } from "../../services/https"; // <-- ปรับ path ให้ถูก
type LivingWith = "parents" | "guardian";
const { Option } = Select;
const { Title } = Typography;
import ModalSave from "../Tabs/ModalSave";

import { useStudentCreate } from "../../pages/admin/ManageStudent/AddStudent/context";

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

const clean = (v: any) => {
  const s = String(v ?? "").trim();
  return s && s !== "-" ? s : "";
};
const toYYYYMMDD = (d: any) => (d ? dayjs(d).format("YYYY-MM-DD") : undefined);

function AddGuardian() {
  const { setGuardian, saveAll, saving } = useStudentCreate();
  const [livingWith, setLivingWith] = useState<LivingWith>("parents");
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isFatherInactive, setIsFatherInactive] = useState(false);
  const [isMotherInactive, setIsMotherInactive] = useState(false);

  const isInactiveStatus = (s: string) => s.includes("เสียชีวิต") || s === "ติดต่อไม่ได้";

  const DASH = {
    id: "-",
    title: "6",
    fnameTH: "-",
    lnameTH: "-",
    tel: "-",   // ✅ ใช้ tel ตัวเล็กให้ตรงกับ name
    job: "-",
    dob: null,
    age: "-",
  };

  const handleStatusChange = (who: "father" | "mother" | "guardian", val: string) => {
    const inactive = isInactiveStatus(val);
    if (who === "father") setIsFatherInactive(inactive);
    if (who === "mother") setIsMotherInactive(inactive);

    if (inactive) {
      form.setFieldsValue({ [who]: { ...DASH } } as any);
    } else {
      const cur = form.getFieldValue(who) || {};
      const undash = (x: any) => (x === "-" ? undefined : x);
      form.setFieldsValue({
        [who]: {
          id: undash(cur.id),
          title: cur.title === "6" ? undefined : cur.title,
          fnameTH: undash(cur.fnameTH),
          lnameTH: undash(cur.lnameTH),
          tel: undash(cur.tel),     // ✅ tel ตัวเล็ก
          job: undash(cur.job),
          dob: cur.dob ?? null,
          age: cur.age === "-" ? undefined : cur.age,
        },
      } as any);
    }
  };

  // แปลงค่าจากฟอร์ม -> personReq ของ backend
  const buildPerson = (prefix: "father" | "mother" | "guardian", values: any) => {
    const p = values?.[prefix] || {};
    const citizen_id = clean(p.id);
    const title_id = p.title ? Number(p.title) : undefined;
    const first_name = clean(p.fnameTH);
    const last_name = clean(p.lnameTH);
    const tel = clean(p.tel);
    const job = clean(p.job);
    const dob = toYYYYMMDD(p.dob);
    const status = clean(p.status);
    const relation = prefix === "guardian" ? clean(p.relation) : undefined;

    const allEmpty =
      !citizen_id && !title_id && !first_name && !last_name && !tel && !job && !dob && !status && !relation;

    if (allEmpty) return undefined;

    const out: any = { citizen_id, first_name, last_name, tel, job, status };
    if (title_id) out.title_id = title_id;
    if (dob) out.dob = dob;
    if (relation) out.relation = relation;
    return out;
  };


  // map form → person draft (เก็บลง context เท่านั้น)
   const mapPerson = (p: any): any => {
    if (!p) return undefined;
    return {
      citizen_id: (p.id ?? "").toString().trim(),
      title_id: p.title ? Number(p.title) : undefined,
      first_name: (p.fnameTH ?? "").toString().trim(),
      last_name: (p.lnameTH ?? "").toString().trim(),
      tel: (p.tel ?? "").toString().trim(),
      job: (p.job ?? "").toString().trim(),
      dob: p.dob ? dayjs(p.dob).format("YYYY-MM-DD") : undefined,
      status: (p.status ?? "").toString().trim(),
      relation: (p.relation ?? "").toString().trim(), // เผื่อกรอก relation ในผู้ปกครอง
    };
  };

  const push = (_: any, all: any) => {
    const lv = (all?.livingWith as LivingWith) || "parents";
    setGuardian({
      living_with: lv,
      father: mapPerson(all?.father),
      mother: mapPerson(all?.mother),
      guardian: lv === "guardian" ? mapPerson(all?.guardian) : undefined,
    });
  };


  const onlyDigits = (s: string) => String(s ?? "").replace(/\D/g, "");
  
  // ตรวจเลขบัตร ปชช.ไทย 13 หลัก (มีเช็คซัม)
  const isThaiCitizenId = (id: string) => {
    const x = onlyDigits(id);
    if (!/^\d{13}$/.test(x)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += Number(x[i]) * (13 - i);
    const check = (11 - (sum % 11)) % 10;
    return check === Number(x[12]);
  };
  
  const onCitizenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = onlyDigits(e.target.value).slice(0, 13); // จำกัด 13 หลัก
    form.setFieldsValue({ citizen_id: v });
  };
  
  const onTelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = onlyDigits(e.target.value).slice(0, 10); // จำกัด 10 หลัก
    form.setFieldsValue({ tel: v });
  };


  const tabStyle = { background: "#fff", padding: 24, borderRadius: 16, minwidth: "60vw", height: "flex", overflow: "auto" };
  // const outerBox: React.CSSProperties = { width: 280, minHeight: 360, border: "1px solid #ccc", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, background: "#fff" };
  // const imageBox: React.CSSProperties = { width: 200, height: 200, border: "1px solid #ccc", borderRadius: "50%", display: "flex", margin: "30px 0px 20px 0px", justifyContent: "center", alignItems: "center", background: "#717171", overflow: "hidden" };

  return (
    <div style={{ padding: 10 }}>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={tabStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Title level={4} style={{ margin: 0 }}>ข้อมูลผู้ปกครอง</Title>
            </div>

            <Form form={form} layout="vertical" onValuesChange={push}>
              {/* เลือกว่าอยู่กับใคร */}
              <Row gutter={16} justify="center">
                <Col span={24}>
                  <Form.Item label="นักเรียนอาศัยอยู่กับ" name="livingWith" initialValue={livingWith}>
                   <Radio.Group
                      value={livingWith}
                      onChange={(e) => {
                        const v = e.target.value as LivingWith;
                        setLivingWith(v);
                        form.setFieldsValue({ livingWith: v });
                        if (v === "parents") form.resetFields([["guardian"]]);
                        // อัปเดต context ทันที
                        const all = form.getFieldsValue(true);
                        push(null, { ...all, livingWith: v });
                      }}
                    >
                      <Radio value="parents">อยู่กับบิดามารดา</Radio>
                      <Radio value="guardian">อยู่กับผู้ปกครอง</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              {/* --------- บิดา --------- */}
              <Title level={4} style={{ marginBottom: 20 }}>บิดา</Title>
              <Row gutter={16} justify="center">
                <Col span={10}>
                  <Form.Item label="เลขบัตรประชาชน" name={["father","id"]}>
                    <Input style={{ height: 35 }} 
                    inputMode="numeric"
                    maxLength={13}
                    disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="คำนำหน้า" name={["father","title"]}>
                    <Select style={{ height: 35 }} disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined}>
                      <Option value="1">นาย</Option>
                      <Option value="2">นางสาว</Option>
                      <Option value="3">นาง</Option>
                      <Option value="4">เด็กชาย</Option>
                      <Option value="5">เด็กหญิง</Option>
                      <Option value="6">-</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="ชื่อ" name={["father","fnameTH"]} >
                    <Input style={{ height: 35 }} disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="นามสกุล" name={["father","lnameTH"]}>
                    <Input style={{ height: 35 }} disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined} />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="เบอร์ติดต่อ" name={["father","tel"]}>
                    <Input style={{ height: 35 }}
                     inputMode="numeric"
                      maxLength={10}
                      disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="อาชีพ" name={["father","job"]}>
                    <Input style={{ height: 35 }} disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined} />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="วันเกิด" name={["father","dob"]}>
                    <DatePicker
                      style={{ width: "100%", height: 35 }}
                      disabled={isFatherInactive}
                      placeholder={isFatherInactive ? "-" : undefined}
                      onChange={(date) => {
                        if (!date) return form.setFieldsValue({ father: { age: undefined } });
                        const age = calculateAge(date.toDate());
                        form.setFieldsValue({ father: { age } });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="อายุ" name={["father","age"]}>
                    <Input disabled style={{ height: 35 }} />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="สถานะ" name={["father","status"]}>
                    <Select style={{ height: 35 }} onChange={(v) => handleStatusChange("father", v)}>
                      <Option value="มีชีวิต">มีชีวิต</Option>
                      <Option value="เสียชีวิต">เสียชีวิต</Option>
                      <Option value="ติดต่อไม่ได้">ติดต่อไม่ได้</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={10} />
              </Row>

              {/* --------- มารดา --------- */}
              <Title level={4} style={{ margin: "20px 0" }}>มารดา</Title>
              <Row gutter={16} justify="center">
                <Col span={10}>
                  <Form.Item label="เลขบัตรประชาชน" name={["mother","id"]}>
                    <Input style={{ height: 35 }} 
                    inputMode="numeric"
                    maxLength={13}
                    disabled={isMotherInactive} placeholder={isMotherInactive ? "-" : undefined}/>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="คำนำหน้า" name={["mother","title"]}>
                    <Select style={{ height: 35 }} disabled={isMotherInactive} placeholder={isMotherInactive ? "-" : undefined}>
                      <Option value="1">นาย</Option>
                      <Option value="2">นางสาว</Option>
                      <Option value="3">นาง</Option>
                      <Option value="4">เด็กชาย</Option>
                      <Option value="5">เด็กหญิง</Option>
                      <Option value="6">-</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="ชื่อ" name={["mother","fnameTH"]}>
                    <Input style={{ height: 35 }} disabled={isMotherInactive} placeholder={isMotherInactive ? "-" : undefined}/>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="นามสกุล" name={["mother","lnameTH"]}>
                    <Input style={{ height: 35 }} disabled={isMotherInactive} placeholder={isMotherInactive ? "-" : undefined}/>
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="เบอร์ติดต่อ" name={["mother","tel"]}>
                    <Input style={{ height: 35 }}
                     inputMode="numeric"
                      maxLength={10}
                      disabled={isMotherInactive} placeholder={isMotherInactive ? "-" : undefined}/>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="อาชีพ" name={["mother","job"]}>
                    <Input style={{ height: 35 }} disabled={isMotherInactive} placeholder={isMotherInactive ? "-" : undefined}/>
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="วันเกิด" name={["mother","dob"]}>
                    <DatePicker
                      style={{ width: "100%", height: 35 }}
                      disabled={isMotherInactive}
                      placeholder={isMotherInactive ? "-" : undefined}
                      onChange={(date) => {
                        if (date) {
                          const age = calculateAge(date.toDate());
                          form.setFieldsValue({ mother: { age } });
                        } else {
                          form.setFieldsValue({ mother: { age: undefined } });
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="อายุ" name={["mother","age"]}>
                    <Input disabled style={{ height: 35 }} />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="สถานะ" name={["mother","status"]}>
                    <Select style={{ height: 35 }} onChange={(v) => handleStatusChange("mother", v)}>
                      <Option value="มีชีวิต">มีชีวิต</Option>
                      <Option value="เสียชีวิต">เสียชีวิต</Option>
                      <Option value="ติดต่อไม่ได้">ติดต่อไม่ได้</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={10} />
              </Row>

              {/* --------- ผู้ปกครอง --------- */}
              {livingWith === "guardian" && (
                <>
                  <Title level={4} style={{ margin: "20px 0" }}>ผู้ปกครอง</Title>
                  <Row gutter={16} justify="center">
                    <Col span={10}>
                      <Form.Item label="เลขบัตรประชาชน" name={["guardian","id"]}>
                        <Input style={{ height: 35 }}
                         inputMode="numeric"
                        maxLength={13}/>
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item label="คำนำหน้า" name={["guardian","title"]}>
                        <Select style={{ height: 35 }}>
                          <Option value="3">นาย</Option>
                          <Option value="4">นางสาว</Option>
                          <Option value="5">นาง</Option>
                          <Option value="1">เด็กชาย</Option>
                          <Option value="2">เด็กหญิง</Option>
                          <Option value="6">-</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={10}>
                      <Form.Item label="ชื่อ" name={["guardian","fnameTH"]}>
                        <Input style={{ height: 35 }} />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item label="นามสกุล" name={["guardian","lnameTH"]}>
                        <Input style={{ height: 35 }} />
                      </Form.Item>
                    </Col>

                    <Col span={10}>
                      <Form.Item label="เบอร์ติดต่อ" name={["guardian","tel"]} >
                        <Input style={{ height: 35 }}
                         inputMode="numeric"
                          maxLength={10} />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item label="อาชีพ" name={["guardian","job"]}>
                        <Input style={{ height: 35 }} />
                      </Form.Item>
                    </Col>

                    <Col span={10}>
                      <Form.Item label="วันเกิด" name={["guardian","dob"]}>
                        <DatePicker
                          style={{ width: "100%", height: 35 }}
                          onChange={(date) => {
                            if (date) {
                              const age = calculateAge(date.toDate());
                              form.setFieldsValue({ guardian: { age } });
                            } else {
                              form.setFieldsValue({ guardian: { age: undefined } });
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item label="อายุ" name={["guardian","age"]}>
                        <Input disabled style={{ height: 35 }} />
                      </Form.Item>
                    </Col>

                    <Col span={10}>
                      <Form.Item label="ความสัมพันธ์" name={["guardian","relation"]}>
                        <Select style={{ height: 35 }}>
                          <Option value="ปู่">ปู่</Option>
                          <Option value="ย่า">ย่า</Option>
                          <Option value="ตา">ตา</Option>
                          <Option value="ยาย">ยาย</Option>
                          <Option value="ลุง">ลุง</Option>
                          <Option value="ป้า">ป้า</Option>
                          <Option value="น้า">น้า</Option>
                          <Option value="อา">อา</Option>
                          <Option value="พี่สาว">พี่สาว</Option>
                          <Option value="พี่ชาย">พี่ชาย</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={10} />
                  </Row>
                </>
              )}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddGuardian;
