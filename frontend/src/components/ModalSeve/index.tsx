import React, { useState } from "react";
import { Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";

const ModalSave = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type="primary" style={{ marginTop: "16px" }} onClick={showModal}>
        บันทึก
      </Button>
      <Modal
        title="ยืนยันการบันทึก"
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
