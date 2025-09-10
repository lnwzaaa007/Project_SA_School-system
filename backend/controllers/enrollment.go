package controllers

import (
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

type EnrollmentCreateRequest struct {
    TitleID     uint   `form:"title_id" binding:"required"`
    TFirst_Name string `form:"t_first_name" binding:"required"`
    TLast_Name  string `form:"t_last_name" binding:"required"`
    EFirst_Name string `form:"e_first_name" binding:"required"`
    ELast_Name  string `form:"e_last_name"  binding:"required"`
    Citizen_ID  string `form:"citizen_id"   binding:"required"`
    Tel         string `form:"tel"          binding:"required"`
    DateOfBirth string `form:"date_of_birth" binding:"required"` // YYYY-MM-DD
    GenderID    uint   `form:"gender_id"    binding:"required"`
    Nationality string `form:"nationality"  binding:"required"`
    Email       string `form:"email"        binding:"required,email"`
    Religious   string `form:"religious"` // optional
    Age         *int `form:"age"`
    Address     string `form:"address"      binding:"required"`
    Guardian    string `form:"guardian"     binding:"required"`
    Grade_Year  int    `form:"grade_year"   binding:"required"`
    Grade_Class int    `form:"grade_class"  binding:"required"`
    Admin_ID    uint   `form:"admin_id"`
}

// saveUploadedFile: สร้างโฟลเดอร์อัตโนมัติและคืน path แบบ web-friendly
func saveUploadedFile(c *gin.Context, field, uploadDir string) (string, error) {
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
    // คืนเป็น path ที่ใช้ forward slash (เหมาะกับเสิร์ฟผ่าน r.Static)
    return strings.ReplaceAll(diskPath, "\\", "/"), nil
}

// เพิ่ม helper คำนวณอายุ
func calcAge(dob time.Time, now time.Time) int {
    y, m, d := now.Date()
    by, bm, bd := dob.Date()

    age := y - by
    if m < bm || (m == bm && d < bd) {
        age--
    }
    if age < 0 {
        age = 0
    }
    return age
}

func CreateEnrollment(c *gin.Context) {
    var req EnrollmentCreateRequest
    if err := c.ShouldBindWith(&req, binding.FormMultipart); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง", "detail": err.Error()})
        return
    }
    fmt.Printf("REQ: %+v\n", req)

    dob, err := time.Parse("2006-01-02", req.DateOfBirth)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "วันเกิดต้องอยู่ในรูปแบบ YYYY-MM-DD"})
        return
    }

    age := calcAge(dob, time.Now())
    if req.Age != nil && *req.Age > 0 {
        age = *req.Age
    }

    // บันทึกไฟล์ (แจ้งชัดว่าไฟล์ไหนขาด)
    torPath, err := saveUploadedFile(c, "transcript_of_records", "uploads/transcripts")
    if err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์ ปพ.1"}); return }
    housePath, err := saveUploadedFile(c, "household_registration_certificate", "uploads/households")
    if err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์ สำเนาทะเบียนบ้าน"}); return }
    cidPath, err := saveUploadedFile(c, "copy_citizen_id", "uploads/citizens")
    if err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์ สำเนาบัตรประชาชน"}); return }
    imgPath, err := saveUploadedFile(c, "student_image", "uploads/images")
    if err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบรูปถ่ายนักเรียน"}); return }

    var religious *string
    if req.Religious != "" {
        religious = &req.Religious
    }

    en := entity.Enrollment{
        TitleID:     req.TitleID,
        TFirst_Name: req.TFirst_Name,
        TLast_Name:  req.TLast_Name,
        EFirst_Name: req.EFirst_Name,
        ELast_Name:  req.ELast_Name,
        Citizen_ID:  req.Citizen_ID,
        Tel:         req.Tel,
        DateOfBirth: dob,
        GenderID:    req.GenderID,
        Nationality: req.Nationality,
        Email:       req.Email,
        Religious:   religious,
        Address:     req.Address,
        Age:         age,
        Guardian:    req.Guardian,
        Grade_Year:  req.Grade_Year,
        Grade_Class: req.Grade_Class,
        AdminID:     req.Admin_ID,

        Transcript_of_Records:              torPath,
        Household_Registration_Certificate: housePath,
        Copy_Citizen_ID:                    cidPath,
        Student_image:                      imgPath,
    }

    if err := config.DB().Create(&en).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกข้อมูลไม่สำเร็จ", "detail": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "message":   "สมัครเรียนสำเร็จ",
        "enroll_id": en.ID,
         "age":       en.Age, 
        "files": gin.H{
            "transcript": torPath,
            "household":  housePath,
            "citizen":    cidPath,
            "image":      imgPath,
        },
    })
}

type Enrollment struct {
    TitleID     uint   `json:"id"`
    TFirst_Name string `json:"t_first_name" `
    TLast_Name  string `json:"t_last_name" `
    EFirst_Name string `json:"e_first_name" `
    ELast_Name  string `json:"e_last_name"  `
    Citizen_ID  string `json:"citizen_id"   `
    Tel         string `json:"tel"          `
    DateOfBirth string `json:"date_of_birth" ` // YYYY-MM-DD
    GenderID    uint   `json:"gender_id"    `
    Nationality string `json:"nationality"  `
    Email       string `json:"email"       `
    Religious   string `json:"religious"` // optional
    Address     string `json:"address"      `
    Age         int    `json:"age"`
    Guardian    string `json:"guardian"     `
    Grade_Year  int    `json:"grade_year"   `
    Grade_Class int    `json:"grade_class"  `
    Admin_ID    uint   `json:"admin_id"`
}

func GetEnrollment(c *gin.Context) {
    var items []entity.Enrollment
    if err := config.DB().
        Order("id ASC").
        Find(&items).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed", "detail": err.Error()})
        return
    }
    // หมายเหตุ: gorm.Model จะส่ง key "ID" (ตัวใหญ่) มาให้
    // ฝั่ง frontend โค้ด normalize ของคุณรองรับทั้ง id/ID แล้ว จึงใช้ได้เลย
    c.JSON(http.StatusOK, items)
}

func GetEnrollmentById(c *gin.Context) {
    id := c.Param("id")
    var item entity.Enrollment
    if err := config.DB().First(&item, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "enrollment not found"})
        return
    }
    c.JSON(http.StatusOK, item)
}

// DeleteEnrollment ลบข้อมูลสมัครเรียนตาม id และพยายามลบไฟล์ที่อัปโหลดไว้
func DeleteEnrollment(c *gin.Context) {
    enrollment_id := c.Param("id")
	id, err := strconv.Atoi(enrollment_id)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	tx := config.DB().Where("id = ?", id).Delete(&entity.Enrollment{})
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
		return
	}
	if tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ลบสำเร็จ",
		"deleted": id,
	})
}

