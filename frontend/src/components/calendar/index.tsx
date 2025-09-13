// import React from 'react';
// import { Calendar, theme } from 'antd';
// import type { CalendarProps } from 'antd';
// import type { Dayjs } from 'dayjs';

// const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
//   console.log(value.format('YYYY-MM-DD'), mode);
// };

// const Calendars: React.FC = () => {
//   const { token } = theme.useToken();

//   const wrapperStyle: React.CSSProperties = {
//     width: '100%',
//     border: `1px solid ${token.colorBorderSecondary}`,
//     borderRadius: token.borderRadiusLG,
//   };

//   return (
//     <div style={wrapperStyle}>
//       <Calendar fullscreen={false} onPanelChange={onPanelChange} />
//     </div>
//   );
// };

// export default Calendars;
import React, { useState, useEffect } from 'react';
import { Calendar, theme, Modal, Input, Button, List } from 'antd';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface CalendarEvent {
  date: string;
  title: string;
  isFixed?: boolean; // ✅ ใช้บอกว่าเป็น event แบบ fix
}

const Calendars: React.FC = () => {
  const { token } = theme.useToken();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [newEvent, setNewEvent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ ฟิกวัน เช่น วันหยุด
  const fixedEvents: CalendarEvent[] = [
    { date: "2025-01-01", title: "วันปีใหม่", isFixed: true },
    { date: "2025-04-13", title: "สงกรานต์", isFixed: true },
    { date: "2025-12-05", title: "วันพ่อแห่งชาติ", isFixed: true },
  ];

  // โหลด events จาก localStorage + รวมกับ fixedEvents
  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    setEvents([...fixedEvents, ...storedEvents]);
  }, []);

  // อัพเดท localStorage (เฉพาะ event ที่ user เพิ่มเอง)
  useEffect(() => {
    const userEvents = events.filter(e => !e.isFixed);
    localStorage.setItem('calendarEvents', JSON.stringify(userEvents));
  }, [events]);

  const dateCellRender = (value: Dayjs) => {
    const listData = events.filter((event) => event.date === value.format("YYYY-MM-DD"));
    return (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {listData.map((item, idx) => (
          <li key={idx} style={{ color: item.isFixed ? "red" : "blue", fontWeight: item.isFixed ? "bold" : "normal" }}>
            • {item.title}
          </li>
        ))}
      </ul>
    );
  };

  const onSelect = (value: Dayjs) => {
    setSelectedDate(value);
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    if (newEvent && selectedDate) {
      const newItem: CalendarEvent = {
        date: selectedDate.format("YYYY-MM-DD"),
        title: newEvent,
      };
      setEvents([...events, newItem]);
      setNewEvent('');
      setIsModalOpen(false);
    }
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    if (event.isFixed) return; // ❌ ห้ามลบ fixed events
    setEvents(events.filter((e) => !(e.date === event.date && e.title === event.title)));
  };

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
  };

  return (
    <div style={wrapperStyle}>
      <Calendar
        fullscreen={false}
        dateCellRender={dateCellRender}
        onSelect={onSelect}
      />

      <Modal
        title={`เพิ่ม Event วันที่ ${selectedDate?.format("YYYY-MM-DD")}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Input
          placeholder="กรอกชื่อ Event"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
        />
        <Button type="primary" onClick={handleAddEvent} style={{ marginTop: 10 }}>
          เพิ่ม Event
        </Button>

        <List
          style={{ marginTop: 20 }}
          bordered
          dataSource={events.filter(e => e.date === selectedDate?.format("YYYY-MM-DD"))}
          renderItem={(item) => (
            <List.Item
              actions={!item.isFixed ? [
                <Button danger onClick={() => handleDeleteEvent(item)}>ลบ</Button>
              ] : []}
            >
              <span style={{ color: item.isFixed ? "red" : "black" }}>
                {item.title} {item.isFixed && "(ฟิก)"}
              </span>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default Calendars;

