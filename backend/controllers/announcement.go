package controllers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)
//post /บันทึกข้อมูลประกาศ /new-announcement
type AnnouncementInput struct {
	Title         string `json:"title" binding:"required"`
	Content       string `json:"content" binding:"required"`
	Category      string `json:"category" binding:"required"`
	Status        string `json:"status"`         // เช่น "ฉบับร่าง" หรือ "เผยแพร่แล้ว"
	CreateDate    string `json:"create_date"`    // ควรเก็บเป็น time.Time ใน entity
	EndDate       string `json:"end_date"`       // ควรเก็บเป็น time.Time
	TargetGroupID uint   `json:"target_group_id" binding:"required"`
	UserID        uint   `json:"user_id"` // ผู้รับแจ้งเตือน
	AdminID       uint   `json:"admin_id"` // ผู้สร้างประกาศ
	TermID        uint   `json:"term_id"`
	EnrollmentID  uint   `json:"enrollment_id"`
}
func CreateAnnouncement(c *gin.Context) {
	var input AnnouncementInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// ตรวจสอบกลุ่มเป้าหมาย
	var targetGroup entity.Target_Group
	if err := config.DB().Where("id = ?", input.TargetGroupID).First(&targetGroup).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบกลุ่มเป้าหมายนี้ในระบบ"})
		return
	}
	// ตรวจสอบความครบถ้วน
	if input.Title == "" || input.Content == "" || input.Category == "" ||
		input.CreateDate == "" || input.EndDate == "" || input.TargetGroupID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ครบ"})
		return
	}
	var status entity.StatusAnnouncement
	if input.Status == "เผยแพร่แล้ว" {
		status = entity.Publish
	} else {
		status = entity.Draft
	}
	
	announcement := entity.Announcement{
		Title:         input.Title,
		Content:       input.Content,
		Category:      input.Category,
		Status:        status,
		Create_Date:   entity.ParseDate(input.CreateDate),
		End_Date:      entity.ParseDate(input.EndDate),
		TimeCreate:    entity.GetCurrentTime(),
		TargetGroupID: input.TargetGroupID,
		AdminID:       input.AdminID,
		TermID:        input.TermID,
		EnrollmentID:  input.EnrollmentID,
	}
	// ค้นหา User ที่จะรับการแจ้งเตือน
	var user entity.Users	
	if err := config.DB().Where("id = ?", input.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบผู้ใช้ที่ระบุ"})
		return
	}
	//บันทึกประกาศ

	if err := config.DB().Create(&announcement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกประกาศได้"})
		return
	}
	//ส่งการแจ้งเตือนไปยังผู้ใช้
	if err := config.DB().Model(&announcement).Association("Users").Append(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถส่งการแจ้งเตือนได้"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": announcement})
	
	
}

// //post /บันทึกข้อมูลประกาศ /new-announcement
// type Target_GroupInput struct {
// 	entity.Announcement
// 	Group_name	string `json:"group_name"`
// }
// //สร้างประกาศ 
// func CreateAnnouncement(c *gin.Context) {
// 	var body entity.Announcement

// 	var input Target_GroupInput
// 	// Bind JSON input เข้ากับ struct
// 	if err := c.ShouldBindJSON(&input); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}
// 	//ตรวจสอบกลุ่มเป้าหมาย
// 	if input.Target_Group == nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาเลือกกลุ่มเป้าหมาย"})
// 		return
// 	}
// 	//ค้นหา กลุ่มเป้าหมาย
// 	var targetGroup entity.Target_Group
// 	if err := config.DB().Where("id = ?", input.Target_Group.ID).First(&targetGroup).Error; err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบกลุ่มเป้าหมายนี้ในระบบ"})
// 		return
// 	}
	
// 	announcememt := input.Announcement
// 	announcememt.TargetGroupID = targetGroup.ID
// 	//ตรวจสอบความครบถ้วน
// 	// if input.Title == "" || input.Content == "" || input.Category == "" ||
// 	// 	input.Create_Date == "" || input.End_Date == "" {
// 	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ครบ"})
// 	// 	return
// 	// }

// 	// if announcement.Title == "" || announcement.Content == "" || announcement.Category == "" ||
// 	// 	announcement.Create_Date.IsZero() || announcement.End_Date.IsZero() || announcement.TimeCreate.IsZero() {
// 	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ครบ"})
// 	// 	return
// 	// }
// 	//สร้างประกาศ
// 	// announcememt := entity.Announcement{
		
// 	// }
// 	if err := config.DB().Create(&entity.Announcement{
// 		Title: body.Title,
// 		Create_Date: body.Create_Date,
// 		End_Date: body.End_Date,
// 		TimeCreate: body.TimeCreate,
// 		Content: body.Content,
// 		Category: body.Category,
// 		Status: body.Status,
// 		TargetGroupID: body.TargetGroupID,
// 		Users: body.Users,


// 	}).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกประกาศได้"})
// 		return
// 	}
// 	c.JSON(http.StatusCreated, gin.H{"data": announcememt})
// }
