import type { TargetGroupInterface } from "./targetgroup";
export interface AnnouncementInterface {
    ID?:                number
    title?:             string;
    content?:           string;
    category?:          string;
    status?:            string;
    create_date?:       string;
    end_date?:          string;
    target_group_id?:   TargetGroupInterface;
    group_name?:        string;
    user_id?:           number;
    admin_id?:          number;
    term_id?:           number;
    enrollment_id?:     number;
    TargetGroupID?:     number;
    time_create?:       string;
    target_group?:      TargetGroupInterface;
    
}


// Title         string `json:"title" binding:"required"`
// 	Content       string `json:"content" binding:"required"`
// 	Category      string `json:"category" binding:"required"`
// 	Status        string `json:"status"`         // เช่น "ฉบับร่าง" หรือ "เผยแพร่แล้ว"
// 	CreateDate    string `json:"create_date"`    // ควรเก็บเป็น time.Time ใน entity
// 	EndDate       string `json:"end_date"`       // ควรเก็บเป็น time.Time
// 	TargetGroupID uint   `json:"target_group_id" `
// 	UserID        uint   `json:"user_id"` // ผู้รับแจ้งเตือน
// 	AdminID       uint   `json:"admin_id"` // ผู้สร้างประกาศ
// 	TermID        uint   `json:"term_id"`
// 	EnrollmentID  uint   `json:"enrollment_id"`