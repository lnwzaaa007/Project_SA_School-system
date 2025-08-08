import { LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

function BackIconButton() {
  const navigate = useNavigate();

  return (
    <LeftOutlined
      style={{ fontSize: 24, cursor: 'pointer' }}
      onClick={() => navigate(-1)}
      title="ย้อนกลับ"
    />
  );
}

export default BackIconButton;
