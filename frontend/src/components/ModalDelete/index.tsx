import React, { useState } from "react";
import { Button, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const ModalDelete = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    // ทำสิ่งที่ต้องการหลังจากกดยืนยัน เช่น ลบข้อมูล
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal} icon={<DeleteOutlined />} style={{background:"#ff1818ff"}} >
        ลบ
      </Button>
      <Modal
        title="ยืนยันการลบ"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        centered 
      >
        <p>คุณต้องการลบข้อมูลนี้หรือไม่?</p>
      </Modal>
    </>
  );
};

export default ModalDelete;
