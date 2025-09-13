// components/Tabs/AddGuardian/index.tsx
import React, { useEffect, useState } from "react";
import {
  Form, Input, Select, DatePicker,
  Row, Col, Radio, Typography, message
} from "antd";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";

// ⬇️ ถ้าไฟล์นี้ใช้ในหน้าแก้ไข ให้ใช้ path ของ EditStudent/context
import { useStudentCreate } from "../../pages/admin/ManageStudent/AddStudent/context";
// ถ้าใช้ในหน้าสร้าง ให้สลับกลับเป็น AddStudent/context แทน:
// import { useStudentCreate } from "../../pages/admin/ManageStudent/AddStudent/context";

import { guardianCRUD } from "../../services/https";

type LivingWith = "parents" | "guardian";
const { Option } = Select;
const { Title } = Typography;

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
const isInactiveStatus = (s?: string) =>
  !!s && (s.includes("เสียชีวิต") || s === "ติดต่อไม่ได้");

export default function EditGuardian() {
  const [form] = Form.useForm();
  const { setGuardian } = useStudentCreate();
  const params = useParams();
  const editingStudentId = params.id ? Number(params.id) : undefined;

  const [livingWith, setLivingWith] = useState<LivingWith>("parents");
  const [isFatherInactive, setIsFatherInactive] = useState(false);
  const [isMotherInactive, setIsMotherInactive] = useState(false);

  const toFormPerson = (it: any | undefined) => {
    if (!it) return undefined;
    const dob = it.dob ? dayjs(it.dob) : null;
    return {
      id: it.citizen_id || undefined,
      title: it.title_id ? String(it.title_id) : undefined,
      fnameTH: it.first_name || undefined,
      lnameTH: it.last_name || undefined,
      tel: it.tel || undefined,
      job: it.job || undefined,
      dob,
      age: dob ? calculateAge(dob.toDate()) : undefined,
      status: it.status || undefined,
      relation: it.relation || undefined,
    };
  };

  const mapPerson = (p: any): any => {
    if (!p) return undefined;
    return {
      citizen_id: clean(p.id),
      title_id: p.title ? Number(p.title) : undefined,
      first_name: clean(p.fnameTH),
      last_name: clean(p.lnameTH),
      tel: clean(p.tel),
      job: clean(p.job),
      dob: p.dob ? dayjs(p.dob).format("YYYY-MM-DD") : undefined,
      status: clean(p.status),
      relation: clean(p.relation),
    };
  };

  useEffect(() => {
    if (!editingStudentId) return;
    (async () => {
      try {
        const res = await guardianCRUD.listByStudent(editingStudentId);
        const items = Array.isArray(res?.data) ? res.data : res?.data?.data || [];

        const f = items.find((x: any) => x.relation === "father");
        const m = items.find((x: any) => x.relation === "mother");
        const g = items.find((x: any) => x.relation === "guardian");

        const father = toFormPerson(f);
        const mother = toFormPerson(m);
        const guardianP = toFormPerson(g);

        const lw: LivingWith = g ? "guardian" : "parents";
        setLivingWith(lw);
        setIsFatherInactive(isInactiveStatus(f?.status));
        setIsMotherInactive(isInactiveStatus(m?.status));

        form.setFieldsValue({
          livingWith: lw,
          father,
          mother,
          guardian: guardianP,
        });

        setGuardian({
          living_with: lw,
          father: mapPerson(father),
          mother: mapPerson(mother),
          guardian: lw === "guardian" ? mapPerson(guardianP) : undefined,
        });
      } catch (e: any) {
        message.error(e?.message || "โหลดข้อมูลผู้ปกครองไม่สำเร็จ");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingStudentId]);

  const handleStatusChange = (who: "father" | "mother", val: string) => {
    const inactive = isInactiveStatus(val);
    if (who === "father") setIsFatherInactive(inactive);
    if (who === "mother") setIsMotherInactive(inactive);
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

  const tabStyle: React.CSSProperties = { background: "#fff", padding: 24, borderRadius: 16, minWidth: "60vw" };

  return (
    <div style={{ padding: 10 }}>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={tabStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Title level={4} style={{ margin: 0 }}>ข้อมูลผู้ปกครอง</Title>
            </div>

            <Form form={form} layout="vertical" onValuesChange={push}>
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
                        const all = form.getFieldsValue(true);
                        push(null as any, { ...all, livingWith: v });
                      }}
                    >
                      <Radio value="parents">อยู่กับบิดามารดา</Radio>
                      <Radio value="guardian">อยู่กับผู้ปกครอง</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              {/* บิดา */}
              <Title level={4} style={{ marginBottom: 20 }}>บิดา</Title>
              <Row gutter={16} justify="center">
                <Col span={10}>
                  <Form.Item label="เลขบัตรประชาชน" name={["father","id"]}>
                    <Input style={{ height: 35 }} inputMode="numeric" maxLength={13}
                           disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined}/>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="คำนำหน้า" name={["father","title"]}>
                    <Select style={{ height: 35 }} disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined}>
                      <Option value="3">นาย</Option>
                      <Option value="4">นางสาว</Option>
                      <Option value="5">นาง</Option>
                      <Option value="6">-</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="ชื่อ" name={["father","fnameTH"]}>
                    <Input style={{ height: 35 }} disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined}/>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="นามสกุล" name={["father","lnameTH"]}>
                    <Input style={{ height: 35 }} disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined}/>
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="เบอร์ติดต่อ" name={["father","tel"]}>
                    <Input style={{ height: 35 }} inputMode="numeric" maxLength={10}
                           disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined}/>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="อาชีพ" name={["father","job"]}>
                    <Input style={{ height: 35 }} disabled={isFatherInactive} placeholder={isFatherInactive ? "-" : undefined}/>
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <Form.Item label="วันเกิด" name={["father","dob"]}>
                    <DatePicker
                      style={{ width: "100%", height: 35 }}
                      disabled={isFatherInactive}
                      placeholder={isFatherInactive ? "-" : undefined}
                      onChange={(date) => {
                        form.setFieldsValue({ father: { age: date ? calculateAge(date.toDate()) : undefined } });
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

              {/* มารดา */}
              <Title level={4} style={{ margin: "20px 0" }}>มารดา</Title>
              <Row gutter={16} justify="center">
                <Col span={10}>
                  <Form.Item label="เลขบัตรประชาชน" name={["mother","id"]}>
                    <Input style={{ height: 35 }} inputMode="numeric" maxLength={13}
                           disabled={isMotherInactive} placeholder={isMotherInactive ? "-" : undefined}/>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="คำนำหน้า" name={["mother","title"]}>
                    <Select style={{ height: 35 }} disabled={isMotherInactive} placeholder={isMotherInactive ? "-" : undefined}>
                      <Option value="3">นาย</Option>
                      <Option value="4">นางสาว</Option>
                      <Option value="5">นาง</Option>
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
                    <Input style={{ height: 35 }} inputMode="numeric" maxLength={10}
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
                        form.setFieldsValue({ mother: { age: date ? calculateAge(date.toDate()) : undefined } });
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

              {/* ผู้ปกครอง */}
              {livingWith === "guardian" && (
                <>
                  <Title level={4} style={{ margin: "20px 0" }}>ผู้ปกครอง</Title>
                  <Row gutter={16} justify="center">
                    <Col span={10}>
                      <Form.Item label="เลขบัตรประชาชน" name={["guardian","id"]}>
                        <Input style={{ height: 35 }} inputMode="numeric" maxLength={13}/>
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item label="คำนำหน้า" name={["guardian","title"]}>
                        <Select style={{ height: 35 }}>
                          <Option value="1">นาย</Option>
                          <Option value="2">นางสาว</Option>
                          <Option value="3">นาง</Option>
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
                      <Form.Item label="เบอร์ติดต่อ" name={["guardian","tel"]}>
                        <Input style={{ height: 35 }} inputMode="numeric" maxLength={10}/>
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
                            form.setFieldsValue({ guardian: { age: date ? calculateAge(date.toDate()) : undefined } });
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
