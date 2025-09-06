package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

type EnrollmentCreateRequest struct {
	TitleID     uint   `form:"title_id"`
	TFirst_Name  string `form:"t_first_name"`
	TLast_Name   string `form:"t_last_name"`
	EFirst_Name  string `form:"e_first_name"`
	ELast_Name   string `form:"e_last_name"`
	Citizen_ID   string `form:"citizen_id"`
	Tel         string `form:"tel"`
	DateOfBirth string `form:"date_of_birth"` // format: 2006-01-02
	GenderID    uint   `form:"gender_id"`
	Nationality string `form:"nationality"`
	Email       string `form:"email"`
	Religious   string `form:"religious"` // optional
	Address     string `form:"address"`
	Guardian    string `form:"guardian"`
	Grade_Year   int    `form:"grade_year"`
	Grade_Class  int    `form:"grade_class"`
	Admin_ID     uint   `form:"admin_id"`
}

// ฟังก์ชันช่วย: เซฟไฟล์และสร้างโฟลเดอร์ถ้ายังไม่มี
func saveUploadedFile(c *gin.Context, field, uploadDir string) (string, error) {
	file, err := c.FormFile(field)
	if err != nil {
		return "", err
	}

	// ✅ auto-create โฟลเดอร์
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			return "", err
		}
	}

	// ตั้งชื่อไฟล์ไม่ให้ซ้ำ
	filename := fmt.Sprintf("%s_%d_%s", field, time.Now().UnixNano(), filepath.Base(file.Filename))
	fullPath := filepath.Join(uploadDir, filename)

	// บันทึกไฟล์
	if err := c.SaveUploadedFile(file, fullPath); err != nil {
		return "", err
	}

	return fullPath, nil
}

func CreateEnrollment(c *gin.Context) {
	var req EnrollmentCreateRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง: " + err.Error()})
		return
	}

	// ตรวจสอบ required fields (ยกเว้น Religious)
	// if req.TitleID == 0 || req.TFirst_Name == "" || req.TLast_Name == "" ||
	// 	req.EFirst_Name == "" || req.ELast_Name == "" || req.Citizen_ID == "" ||
	// 	req.Tel == "" || req.DateOfBirth == "" || req.GenderID == 0 ||
	// 	req.Nationality == "" || req.Email == "" || req.Address == "" ||
	// 	req.Guardian == "" || req.Grade_Year == 0 || req.Grade_Class == 0 ||
	// 	req.Admin_ID == 0 {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกข้อมูลให้ครบถ้วน (ยกเว้นศาสนา)"})
	// 	return
	// }

	// dob, err := time.Parse("2006-01-02", req.DateOfBirth)
	// if err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "วันเกิดต้องอยู่ในรูปแบบ YYYY-MM-DD"})
	// 	return
	// }

	// ✅ เซฟไฟล์ + auto-create โฟลเดอร์
	torPath, err1 := saveUploadedFile(c, "transcript_of_records", "uploads/transcripts")
	housePath, err2 := saveUploadedFile(c, "household_registration_certificate", "uploads/households")
	cidPath, err3 := saveUploadedFile(c, "copy_citizen_id", "uploads/citizens")
	imgPath, err4 := saveUploadedFile(c, "student_image", "uploads/images")

	if err1 != nil || err2 != nil || err3 != nil || err4 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องแนบไฟล์ ปพ.1, ทะเบียนบ้าน, บัตรประชาชน และรูปถ่าย"})
		return
	}

	var religious *string
	if req.Religious != "" {
		religious = &req.Religious
	}

	en := entity.Enrollment{
		TitleID:     req.TitleID,
		TFirst_Name:  req.TFirst_Name,
		TLast_Name:   req.TLast_Name,
		EFirst_Name:  req.EFirst_Name,
		ELast_Name:   req.ELast_Name,
		Citizen_ID:   req.Citizen_ID,
		Tel:         req.Tel,
		// DateOfBirth: dob,
		GenderID:    req.GenderID,
		Nationality: req.Nationality,
		Email:       req.Email,
		Religious:   religious,
		Address:     req.Address,
		Guardian:    req.Guardian,
		Grade_Year:   req.Grade_Year,
		Grade_Class:  req.Grade_Class,
		AdminID:     req.Admin_ID,

		Transcript_of_Records: torPath,
		Household_Registration_Certificate:      housePath,
		Copy_Citizen_ID:    cidPath,
		Student_image:      imgPath,
	}

	if err := config.DB().Create(&en).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกข้อมูลไม่สำเร็จ: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "สมัครเรียนสำเร็จ",
		"enroll_id":  en.ID,
		"files": gin.H{
			"transcript": torPath,
			"household":  housePath,
			"citizen":    cidPath,
			"image":      imgPath,
		},
	})
}
