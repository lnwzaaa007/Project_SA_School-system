import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}  >
      กลับ
    </Button>
  );
};

export default BackButton;
