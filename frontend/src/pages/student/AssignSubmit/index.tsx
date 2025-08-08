import React, { useState } from 'react';
import { Select } from 'antd';
import { Link } from 'react-router-dom';

function index() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const OPTIONS = [
    'ภาษาไทย', 'คณิตศาสตร์', 'พละศึกษา', 'วิทยาศาสตร์', 'สังคมศึกษา', 'ศิลปะ', 'ดนตรี',
    'เทคโนโลยีสารสนเทศ', 'ภาษาอังกฤษ', 'ภาษาจีน', 'ภาษาญี่ปุ่น', 'ประวัติศาสตร์', 'ภูมิศาสตร์', 'เศรษฐศาสตร์'
  ];

  const filteredOptions = OPTIONS.filter((o) => !selectedItems.includes(o));
  
  return (
    <div>
      <span style={{ color: "black", fontSize: "16px", fontWeight: "bold" }}>รายวิชา</span>
      <span>
        <Select
          mode="multiple"
          placeholder="Inserted are removed"
          value={selectedItems}
          onChange={setSelectedItems}
          style={{ marginLeft: '20px', width: '30%' }}
          options={filteredOptions.map((item) => ({
            value: item,
            label: item,
          }))}
        />
      </span>
      <div style={{ marginTop: "30px" }}>
        {[1, 2, 3, 4].map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "#B3E0FF",
              padding: "15px 20px",
              borderRadius: "15px",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* ไอคอน 📎 */}
            <div style={{ fontSize: "20px" }}>📎 แนบไฟล์การบ้าน</div>

            {/* ปุ่ม */}
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="file-upload">
              <button
                style={{
                  backgroundColor: "#278FDB",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                >
                ส่งงาน
              </button>
                </Link>

              <Link to="file-upload">
              <button
                style={{
                  backgroundColor: "#F06464",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                แก้ไข
              </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default index;