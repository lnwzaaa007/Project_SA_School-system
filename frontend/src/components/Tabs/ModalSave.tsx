import React, { useState } from "react";
import { Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";

interface ModalSaveProps {
  style?: React.CSSProperties;     // 👈 รับ style จากนอกไฟล์
  buttonText?: string;             // 👈 ให้เปลี่ยนชื่อปุ่มได้
  modalTitle?: string;             // 👈 ให้เปลี่ยน title modal ได้
}

const ModalSave: React.FC<ModalSaveProps> = ({
  style,
  buttonText = "บันทึกข้อมูล",
  modalTitle = "ยืนยันการบันทึก",
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleOk = () => {
    setIsModalOpen(false);
    navigate(-1);
  };
  const handleCancel = () => setIsModalOpen(false);

  return (
    <>
      {/* 👇 ใช้ style ที่ส่งมาจาก props */}
      <Button type="primary" style={style} onClick={showModal}>
        {buttonText}
      </Button>

      <Modal
        title={modalTitle}
        open={isModalOpen}
        onCancel={handleCancel}
        centered
        footer={[
          <Button key="ok" type="primary" onClick={handleOk}>
            ยืนยัน
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            ยกเลิก
          </Button>,
        ]}
      >
        <p>คุณต้องการบันทึกข้อมูลนี้หรือไม่?</p>
      </Modal>
    </>
  );
};

export default ModalSave;