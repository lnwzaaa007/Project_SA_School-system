import React, { useState } from "react";
import { Select, Button } from "antd";
import { Link } from "react-router-dom";

// กล่องชำระเงินแต่ละรายการ
function PaymentBox({ name }: { name: string }) {
  return (
    <div
      style={{
        width: "80%",
        backgroundColor: "#cceaff",
        padding: "20px",
        marginBottom: "20px",
        borderRadius: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>{name}</div>
      <Link to="/wallet/file-payment">
        <Button
          type="primary"
          style={{
            borderRadius: "20px",
            paddingInline: "24px",
          fontWeight: "bold",
        }}
      >
        ชำระเงิน
      </Button>
      </Link>
    </div>
  );
}

function Payment() {
  const [gradeOPTIONS, setGradeOptions] = useState<string[]>([]);
  const [termOPTIONS, setTermOptions] = useState<string[]>([]);

  // ชั้นปีการศึกษา
  const GradeOPTIONS = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
  const GradeOptions = GradeOPTIONS.filter((o) => !gradeOPTIONS.includes(o));

  // เทอม
  const TermOPTIONS = ["เทอม 1", "เทอม 2"];
  const TermOptions = TermOPTIONS.filter((o) => !termOPTIONS.includes(o));

  // สมมุติข้อมูลนักเรียนที่ต้องชำระเงิน
  const paymentData = [
    { id: 1, name: "นักเรียน ม.1 เทอม 1" },
    { id: 2, name: "นักเรียน ม.1 เทอม 2" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "10px",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>ชำระเงิน</h1>

      {/* Select เลือกกรอง */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <Select
          mode="multiple"
          placeholder="เลือกชั้นปี"
          value={gradeOPTIONS}
          onChange={setGradeOptions}
          style={{ width: "200px" }}
          options={GradeOptions.map((item) => ({
            value: item,
            label: item,
          }))}
        />

        <Select
          mode="multiple"
          placeholder="เลือกเทอม"
          value={termOPTIONS}
          onChange={setTermOptions}
          style={{ width: "200px" }}
          options={TermOptions.map((item) => ({
            value: item,
            label: item,
          }))}
        />
      </div>

      {/* กล่องชำระเงิน */}
      {paymentData.map((data) => (
        <PaymentBox key={data.id} name={data.name} />
      ))}
    </div>
  );
}

export default Payment;
