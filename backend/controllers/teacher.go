package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
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
	Teacher_image string `json:"teacher_image"`
}

func GetNameTeacher(c *gin.Context) {
	var teacher []NameOnlyTeacher
	if err := config.DB().
        Raw("SELECT MIN(id) AS id, t_first_name,t_last_name,teacher_id,qualification,teacher_image FROM teachers WHERE deleted_at IS NULL  GROUP BY id ORDER BY id ASC").
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

// controllers/teacher.go
type TeacherDetailResponse struct {
    ID                 uint   `json:"id"`
    TeacherID          string `json:"teacher_id"`
    TitleID            uint   `json:"title_id"`
    TFirstName         string `json:"t_first_name"`
    TLastName          string `json:"t_last_name"`
    EFirstName         string `json:"e_first_name"`
    ELastName          string `json:"e_last_name"`
    CitizenID          string `json:"citizen_id"`
    Tel                string `json:"tel"`
    DateOfBirth        string `json:"date_of_birth"` // YYYY-MM-DD
    GenderID           uint   `json:"gender_id"`
    Nationality        string `json:"nationality"`
    Email              string `json:"email"`
    Religious          string `json:"religious"`
    Qualification      string `json:"qualification"`
    TeacherImage       string `json:"teacher_image"`
    QualImage          string `json:"qualification_image"`
    AddressID          uint   `json:"address_id"`
    AddressNumber      string `json:"address_number"`
    Road               string `json:"road"`
    ThaiProvinceID     uint   `json:"thai_province_id"`
    ThaiDistrictID     uint   `json:"thai_district_id"`
    ThaiSubdistrictID  uint   `json:"thai_subdistrict_id"`
}

// ✅ แทนที่ฟังก์ชันเดิมให้เลือกมาคนเดียว พร้อม address
func GetTeacherDetailById(c *gin.Context) {
    id := c.Param("id")

    // ดึงข้อมูลดิบ (date เป็น time.Time)
    type row struct {
        ID                uint
        TeacherID         string
        TitleID           uint
        TFirstName        string
        TLastName         string
        EFirstName        string
        ELastName         string
        CitizenID         string
        Tel               string
        DateOfBirth       *time.Time `gorm:"column:date_of_birth"`
        GenderID          uint
        Nationality       string
        Email             string
        Religious         string
        Qualification     string
        TeacherImage      string
        QualImage         string      `gorm:"column:qualification_image"`
        AddressID         uint
        AddressNumber     string      `gorm:"column:address_number"`
        Road              string
        ThaiProvinceID    uint        `gorm:"column:thai_province_id"`
        ThaiDistrictID    uint        `gorm:"column:thai_district_id"`
        ThaiSubdistrictID uint        `gorm:"column:thai_subdistrict_id"`
    }

    var r row
    err := config.DB().Raw(`
        SELECT
          t.id                         AS id,
          t.teacher_id                 AS teacher_id,
          t.title_id                   AS title_id,
          t.t_first_name               AS t_first_name,
          t.t_last_name                AS t_last_name,
          t.e_first_name               AS e_first_name,
          t.e_last_name               AS e_last_name,
          t.citizen_id                 AS citizen_id,
          t.tel                        AS tel,
          t.date_of_birth              AS date_of_birth,
          t.gender_id                  AS gender_id,
          t.nationality                AS nationality,
          t.email                      AS email,
          t.religious                  AS religious,
          t.qualification              AS qualification,
          t.teacher_image              AS teacher_image,
          t.qualification_image        AS qualification_image,
          t.address_id                 AS address_id,
          a.address_number             AS address_number,
          a.road                       AS road,
          a.thai_province_id           AS thai_province_id,
          a.thai_district_id           AS thai_district_id,
          a.thai_subdistrict_id        AS thai_subdistrict_id
        FROM teachers t
        LEFT JOIN addresses a ON a.id = t.address_id
        WHERE t.id = ?
        LIMIT 1
    `, id).Scan(&r).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
    if r.ID == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "teacher not found"})
        return
    }

    resp := TeacherDetailResponse{
        ID:                r.ID,
        TeacherID:         r.TeacherID,
        TitleID:           r.TitleID,
        TFirstName:        r.TFirstName,
        TLastName:         r.TLastName,
        EFirstName:        r.EFirstName,
        ELastName:         r.ELastName,
        CitizenID:         r.CitizenID,
        Tel:               r.Tel,
        DateOfBirth:       func() string { if r.DateOfBirth != nil { return r.DateOfBirth.Format("2006-01-02") }; return "" }(),
        GenderID:          r.GenderID,
        Nationality:       r.Nationality,
        Email:             r.Email,
        Religious:         r.Religious,
        Qualification:     r.Qualification,
        TeacherImage:      r.TeacherImage,
        QualImage:         r.QualImage,
        AddressID:         r.AddressID,
        AddressNumber:     r.AddressNumber,
        Road:              r.Road,
        ThaiProvinceID:    r.ThaiProvinceID,
        ThaiDistrictID:    r.ThaiDistrictID,
        ThaiSubdistrictID: r.ThaiSubdistrictID,
    }
    c.JSON(http.StatusOK, resp)
}


func GetTeacherDetail(c *gin.Context) {
	var teacher []TeacherDetailResponse
	if err := config.DB().
        Raw("SELECT teachers.*,addresses.address_id FROM teachers inner join addresses on teachers.address_id = addresses.id ").
        Scan(&teacher).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, teacher)
}


func safeRemove(p string) {
    if p == "" {
        return
    }
    // กัน path แปลก ๆ นิดหน่อย
    clean := filepath.Clean(p)
    // (ถ้าต้องการเข้มขึ้น ตรวจว่าอยู่ใต้ "uploads/" เท่านั้น)
    _ = os.Remove(clean)
}



func DeleteTeacher(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil || id <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }

    // ดึงครูก่อน เผื่ออยากจัดการ address เพิ่มเติม
    var t entity.Teacher
    if err := config.DB().First(&t, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
        return
    }

    // (ตัวเลือก) ถ้าต้องการลบ address ที่ผูกกับครูไปด้วย ให้ปลด FK ที่ฝั่งครูก่อน
    // ถ้าไม่ต้องการก็ลบครูได้เลยโดยไม่ต้องยุ่งกับ addresses
    // _ = config.DB().Model(&entity.Teacher{}).Where("id = ?", id).Update("address_id", nil)
    // if t.AddressID != 0 {
    //     _ = config.DB().Delete(&entity.Address{}, t.AddressID).Error
    // }

    if err := config.DB().Delete(&entity.Teacher{}, id).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "ลบสำเร็จ",
        "deleted": id,
    })
}
