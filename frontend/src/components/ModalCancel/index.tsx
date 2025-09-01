import React, { useState } from "react";
import { Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";

const ModalCancel = () => {
    const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    navigate(-1);
    // ทำสิ่งที่ต้องการหลังจากกดยืนยัน เช่น ลบข้อมูล
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button  style={{ marginTop: '16px' ,backgroundColor:"#ffffffff",color:"black"}} onClick={showModal}   >
        ยกเลิก
      </Button>
      <Modal
        title="ยืนยันการยกเลิก"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        centered // ✅ ให้แสดงกลางหน้าจอ
        footer={[
                  <Button key="ok" type="primary" onClick={handleOk}>
                    ยืนยัน
                  </Button>,
                  <Button key="cancel" onClick={handleCancel}>
                    ยกเลิก
                  </Button>,
                ]}
      >
        <p>คุณต้องการยกเลิกข้อมูลนี้หรือไม่?</p>
      </Modal>
    </>
  );
};

export default ModalCancel;
