package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)
type NameOnlyTeacher struct {
    ID          uint   `json:"id"`
    Teacher_ID string `json:"teacher_id"`
	TFirst_Name string `json:"t_first_name"`
	TLast_Name  string `json:"t_last_name"`
    Qualification string `json:"qualification"`
}

func GetNameTeacher(c *gin.Context) {
	var teacher []NameOnlyTeacher
	if err := config.DB().
        Raw("SELECT MIN(id) AS id, t_first_name,t_last_name,teacher_id,qualification FROM teachers GROUP BY id ORDER BY id ASC").
        Scan(&teacher).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, teacher)
}
// GET /teachers/:user_id    get all techer by user_id
func GetTeacherAllById(c *gin.Context) {
	id := c.Param("user_id") // รับ ID จาก URL param เช่น /students/:id
	var teacher entity.Teacher
	if err := config.DB().First(&teacher, "users_id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบครูที่มี ID นี้"})
		return
	}
	c.JSON(http.StatusOK, teacher)
}

// GET /NameTeacher/:id    get name techer by teacher id เรียกผ่าน id ครูไม่ใช่ user_id
func GetNameTeacherById(c *gin.Context) {
	var name NameOnlyTeacher
	id := c.Param("id")

	if err := config.DB().Table("teachers").
		Select("*").
		Where("id = ?", id).
		Scan(&name).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "teacher not found"})
		return
	}
	c.JSON(http.StatusOK, name)
}

// GET /teachers    get name techer all
func GetNameTeacherAll(c *gin.Context) {
    var names []NameOnlyTeacher
    if err := config.DB().Table("teachers").
        Select("id, teacher_id, t_first_name, t_last_name, qualification").
        Scan(&names).Error; err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "teachers not found"})
        return
    }
    c.JSON(http.StatusOK, names)
}

type TeacherCreateRequest struct {
	TeacherID    string `form:"teacher_id" binding:"required"`
	TitleID      uint   `form:"title_id" binding:"required"`
	TFirstName   string `form:"t_first_name" binding:"required"`
	TLastName    string `form:"t_last_name" binding:"required"`
	EFirstName   string `form:"e_first_name"`
	ELastName    string `form:"e_last_name"`
	CitizenID    string `form:"citizen_id" binding:"required"`
	Tel          string `form:"tel" binding:"required"`
	DateOfBirth  string `form:"date_of_birth" binding:"required"` // YYYY-MM-DD
	GenderID     uint   `form:"gender_id" binding:"required"`
	Nationality  string `form:"nationality" binding:"required"`
	Email        string `form:"email" binding:"required,email"`
	Religious    string `form:"religious"`
	Qualification string `form:"qualification"`

	AddressID uint `form:"address_id"`
	UsersID   uint `form:"users_id"`
}

// -------------------------------
// Helpers: เซฟไฟล์ (บังคับต้องมี / Optional)
// -------------------------------
func saveUploadedFileRequired(c *gin.Context, field, uploadDir string) (string, error) {
	f, err := c.FormFile(field)
	if err != nil {
		return "", err
	}
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", err
	}
	name := fmt.Sprintf("%s_%d_%s", field, time.Now().UnixNano(), filepath.Base(f.Filename))
	diskPath := filepath.Join(uploadDir, name)
	if err := c.SaveUploadedFile(f, diskPath); err != nil {
		return "", err
	}
	return strings.ReplaceAll(diskPath, "\\", "/"), nil
}

func saveUploadedFileOptional(c *gin.Context, field, uploadDir string) (string, error) {
	f, err := c.FormFile(field)
	if err != nil {
		// ถ้าไม่ส่งไฟล์มาก็ให้ว่างไป
		if errors.Is(err, http.ErrMissingFile) {
			return "", nil
		}
		return "", err
	}
	if f == nil {
		return "", nil
	}
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", err
	}
	name := fmt.Sprintf("%s_%d_%s", field, time.Now().UnixNano(), filepath.Base(f.Filename))
	diskPath := filepath.Join(uploadDir, name)
	if err := c.SaveUploadedFile(f, diskPath); err != nil {
		return "", err
	}
	return strings.ReplaceAll(diskPath, "\\", "/"), nil
}

// -------------------------------
// POST /teachers  (สร้างอาจารย์ใหม่)
// -------------------------------
func CreateTeacher(c *gin.Context) {
	var req TeacherCreateRequest
	if err := c.ShouldBindWith(&req, binding.FormMultipart); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง", "detail": err.Error()})
		return
	}

	// ตรวจ format วันเกิด
	dob, err := time.Parse("2006-01-02", req.DateOfBirth)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "วันเกิดต้องอยู่ในรูปแบบ YYYY-MM-DD"})
		return
	}

	// teacher_id ต้องไม่ซ้ำ
	var cnt int64
	if err := config.DB().Model(&entity.Teacher{}).
		Where("teacher_id = ?", req.TeacherID).
		Count(&cnt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ตรวจสอบ teacher_id ไม่สำเร็จ"})
		return
	}
	if cnt > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "teacher_id นี้มีอยู่ในระบบแล้ว"})
		return
	}

	// ไฟล์: รูปอาจารย์ (optional), ไฟล์วุฒิการศึกษา (optional)
	// เปลี่ยนโฟลเดอร์ตามที่ต้องการได้
	teacherImgPath, err := saveUploadedFileOptional(c, "teacher_image", "uploads/teachers")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "อัปโหลดรูปอาจารย์ไม่สำเร็จ", "detail": err.Error()})
		return
	}
	qualImgPath, err := saveUploadedFileOptional(c, "qualification_image", "uploads/teacher_qualifications")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "อัปโหลดไฟล์วุฒิการศึกษาไม่สำเร็จ", "detail": err.Error()})
		return
	}

	// map ไปยัง entity.Teacher (คอลัมน์ใน DB)
	t := entity.Teacher{
		Teacher_ID:  req.TeacherID,
		TitleID:     req.TitleID,
		TFirst_Name: req.TFirstName,
		TLast_Name:  req.TLastName,
		EFirst_Name: req.EFirstName,
		ELast_Name:  req.ELastName,
		Citizen_ID:  req.CitizenID,
		Tel:         req.Tel,
		DateOfBirth: dob,
		GenderID:    req.GenderID,
		Nationality: req.Nationality,
		Email:       req.Email,
		Religious:   req.Religious,
		Qualification:       req.Qualification,
		Teacher_image:       teacherImgPath,
		Qualification_image: qualImgPath,
		AddressID:           req.AddressID,
		UsersID:             req.UsersID,
	}

	if err := config.DB().Create(&t).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกข้อมูลไม่สำเร็จ", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "สร้างข้อมูลอาจารย์สำเร็จ",
		"id":      t.ID,
		"teacher": t,
		"files": gin.H{
			"teacher_image":       teacherImgPath,
			"qualification_image": qualImgPath,
		},
	})
}


