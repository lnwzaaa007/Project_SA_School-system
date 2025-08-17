import React, { useState } from "react";
import { Button, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ModalCheckStatus = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    navigate(-1); // กลับไปยังหน้าก่อนหน้า
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type="primary"
        onClick={showModal}
        style={{ background: "#ff1818ff", justifyContent: "center" }}
      >
        ตรวจสอบสถานะ
      </Button>

      <Modal
        title="สถานะของคุณ"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="ตกลง"
        cancelButtonProps={{ style: { display: 'none' } }} // ❌ ซ่อนปุ่ม Cancel
        centered
        closable={true} // ✅ แสดงปุ่มกากบาท
        maskClosable={false} // ❌ ปิด modal โดยคลิกข้างนอกไม่ได้
      >
        <p>ไม่พบข้อมูล</p>
      </Modal>
    </>
  );
};

export default ModalCheckStatus;
