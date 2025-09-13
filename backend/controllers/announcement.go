package controllers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)
//post /บันทึกข้อมูลประกาศ /new-announcement
type AnnouncementInput struct {
	ID    		  uint   `json:"id"`
	Title         string `json:"title" binding:"required"`
	Content       string `json:"content" binding:"required"`
	Category      string `json:"category"`
	Status        string `json:"status"`         // เช่น "ฉบับร่าง" หรือ "เผยแพร่แล้ว"
	CreateDate    string `json:"create_date"`    // ควรเก็บเป็น time.Time ใน entity
	EndDate       string `json:"end_date"`       // ควรเก็บเป็น time.Time
	TimeCreate	  string `json:"time_create"`
	TargetGroupID uint   `json:"target_group_id" `
	// UserID        uint   `json:"user_id"` // ผู้รับแจ้งเตือน
	// AdminID       uint   `json:"admin_id"` // ผู้สร้างประกาศ
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
		input.CreateDate == "" || input.EndDate == "" || input.TargetGroupID == 0 || input.TimeCreate == ""{
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
		// TimeCreate:    entity.GetCurrentTime(),
		// TimeCreate: 	entity.ParseTime(input.TimeCreate),	
		TimeCreate: 	input.TimeCreate,
		TargetGroupID: input.TargetGroupID,
		// AdminID:       input.AdminID,
		TermID:        input.TermID,
		EnrollmentID:  input.EnrollmentID,
	}
	// ค้นหา User ที่จะรับการแจ้งเตือน
	// var user entity.Users	
	// if err := config.DB().Where("id = ?", input.UserID).First(&user).Error; err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบผู้ใช้ที่ระบุ"})
	// 	return
	// }
	//บันทึกประกาศ

	if err := config.DB().Create(&announcement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกประกาศได้"})
		return
	}
	//ส่งการแจ้งเตือนไปยังผู้ใช้
	// if err := config.DB().Model(&announcement).Association("Users").Append(&user); err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถส่งการแจ้งเตือนได้"})
	// 	return
	// }
	c.JSON(http.StatusCreated, gin.H{"data": announcement})
	
	
}
// type ResultByAnnouncementID struct{
// 	ID 			  uint 	 `json:"id"`
// 	Title         string `json:"title"`
// 	Content       string `json:"content"`
// 	Category      string `json:"category"`
// 	Status        string `json:"status"`         // เช่น "ฉบับร่าง" หรือ "เผยแพร่แล้ว"
// 	CreateDate    string `json:"create_date"`    // ควรเก็บเป็น time.Time ใน entity
// 	EndDate       string `json:"end_date"`       // ควรเก็บเป็น time.Time
// 	TargetGroupID uint   `json:"target_group_id" `
// 	UserID        uint   `json:"user_id"` // ผู้รับแจ้งเตือน
// 	AdminID       uint   `json:"admin_id"` // ผู้สร้างประกาศ
// 	TermID        uint   `json:"term_id"`
// 	EnrollmentID  uint   `json:"enrollment_id"`
// }

// get ข้อมูล
func ListAnnouncements(c *gin.Context){
	
	// id := c.Param("id")
	var announcements []entity.Announcement
	if err := config.DB().
		Preload("Target_Group").
		Preload("Admin_User").
		Preload("Term").
		Preload("Enrollment").
		Preload("Enrollments").
		
		Where("announcements.deleted_at IS NULL").
		Find(&announcements).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
		}
	c.JSON(http.StatusOK, announcements)
}
// ลบข้อมูล
func DeleteAnnouncement(c *gin.Context){
	announcementID :=c.Param("id")
	var announcement entity.Announcement
	//ค้นหาข้อมูลตาม id
	if err := config.DB().Where("id = ?", announcementID).First(&announcement).Error; err != nil{
		c.JSON(http.StatusNotFound, gin.H{"error":"ไม่พบข้อมูลประกาศ"})
		return
	}
	if err := config.DB().Delete(&announcement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบข้อมูลไม่สำเร็จ"})
		return
	}
	// ลบสำเร็จให้ ให้ส่งค่ากลับเป็น true
	c.JSON(http.StatusOK, gin.H{"data": true})
}
//เปลี่ยนสถานะประกาศ
func PublishAnnouncement(c *gin.Context) {
    id := c.Param("id")

    var announcement entity.Announcement
    if err := config.DB().First(&announcement, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Announcement not found"})
        return
    }

    announcement.Status = "เผยแพร่แล้ว"
    if err := config.DB().Save(&announcement).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Published successfully", "announcement": announcement})
}

// PUT /announcements/:id
func UpdateAnnouncement(c *gin.Context) {
    id := c.Param("id")
    var announcement entity.Announcement

    // ค้นหาประกาศจาก id ก่อน
    if err := config.DB().Where("id = ?", id).First(&announcement).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลประกาศ"})
        return
    }

    // รับค่า JSON ที่ส่งมา
    var input AnnouncementInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // ตรวจสอบ Target Group ว่ายังมีอยู่มั้ย (ถ้ามีการอัปเดต)
    if input.TargetGroupID != 0 {
        var targetGroup entity.Target_Group
        if err := config.DB().Where("id = ?", input.TargetGroupID).First(&targetGroup).Error; err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบกลุ่มเป้าหมายนี้ในระบบ"})
            return
        }
    }

    // กำหนดค่า status
    // var status entity.StatusAnnouncement
    // if input.Status == "เผยแพร่แล้ว" {
    //     status = entity.Publish
    // } else {
    //     status = entity.Draft
    // }
	// กำหนด default status เป็น "ฉบับร่าง" หาก frontend ไม่ส่งค่า หรือส่งค่าไม่ถูกต้อง
	status := entity.Draft // ค่า default

	if input.Status == string(entity.Publish) || input.Status == string(entity.Draft) {
		status = entity.StatusAnnouncement(input.Status)
	}

    // อัปเดตค่า
    updated := entity.Announcement{
        Title:         input.Title,
        Content:       input.Content,
        Category:      input.Category,
        Status:        status,
        Create_Date:   entity.ParseDate(input.CreateDate),
        End_Date:      entity.ParseDate(input.EndDate),
		TimeCreate:	   input.TimeCreate,
        TargetGroupID: input.TargetGroupID,
        TermID:        input.TermID,
        EnrollmentID:  input.EnrollmentID,
    }

    if err := config.DB().Model(&announcement).Updates(updated).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตข้อมูลประกาศได้"})
        return
    }
}
//ดึงข้อมูลประกาศตาม id 
func GetAnnouncementByID(c *gin.Context){
	announcementID := c.Param("id")
	var announcement entity.Announcement
	if err := config.DB().
	Preload("Target_Group").
        Preload("Admin_User").
        Preload("Term").
        Preload("Enrollment").
        Preload("Enrollments").
        Where("id = ? AND announcements.deleted_at IS NULL", announcementID).
        First(&announcement).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลประกาศ"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": announcement})

}
