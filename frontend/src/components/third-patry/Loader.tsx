import { LoadingOutlined } from "@ant-design/icons";

const Loader: React.FC = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 9999, // ✅ สูงสุดเพื่ออยู่บน Sider
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#ddddddcc", // โปร่งใสนิดนึง
    }}
  >
    <LoadingOutlined
      style={{
        fontSize: 100,
        color: "#ffffffff",
      }}
      spin
    />
  </div>
);

export default Loader;
