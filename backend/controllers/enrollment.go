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
	"gorm.io/gorm"
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
func saveUploadedEnrollment(c *gin.Context, field, uploadDir string) (string, error) {
	// ถ้าไม่ใช่ multipart ก็ไม่ต้องพยายามอ่านไฟล์
	ct := c.Request.Header.Get("Content-Type")
	if !strings.HasPrefix(ct, "multipart/form-data") {
		return "", nil
	}
	f, err := c.FormFile(field)
	if err != nil {
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
	name := filepath.Base(f.Filename)
	name = field + "_" + time.Now().Format("20060102150405.000000000") + "_" + name
	path := filepath.Join(uploadDir, name)
	if err := c.SaveUploadedFile(f, path); err != nil {
		return "", err
	}
	return strings.ReplaceAll(path, "\\", "/"), nil
}

func safeRemoveEnrollment(path string) {
	if path == "" {
		return
	}
	_ = os.Remove(filepath.Clean(path))
}

func UpdateEnrollment(c *gin.Context) {
	id := c.Param("id")

	var en entity.Enrollment
	if err := config.DB().First(&en, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "enrollment not found"})
		return
	}

	// ใช้ pointer fields เพื่อรู้ว่า client ส่งอะไรมาอัปเดตบ้าง
	type Req struct {
		TitleID     *uint   `json:"title_id"     form:"title_id"`
		TFirstName  *string `json:"t_first_name" form:"t_first_name"`
		TLastName   *string `json:"t_last_name"  form:"t_last_name"`
		EFirstName  *string `json:"e_first_name" form:"e_first_name"`
		ELastName   *string `json:"e_last_name"  form:"e_last_name"`
		CitizenID   *string `json:"citizen_id"   form:"citizen_id"`
		Tel         *string `json:"tel"          form:"tel"`
		DateOfBirth *string `json:"date_of_birth" form:"date_of_birth"` // YYYY-MM-DD
		GenderID    *uint   `json:"gender_id"    form:"gender_id"`
		Nationality *string `json:"nationality"  form:"nationality"`
		Email       *string `json:"email"        form:"email"`
		Religious   *string `json:"religious"    form:"religious"`
		Address     *string `json:"address"      form:"address"`
		Age         *int    `json:"age"          form:"age"`
		Guardian    *string `json:"guardian"     form:"guardian"`
		GradeYear   *int    `json:"grade_year"   form:"grade_year"`
		GradeClass  *int    `json:"grade_class"  form:"grade_class"`
		AdminID     *uint   `json:"admin_id"     form:"admin_id"`
		Status      *string `json:"status"       form:"status"`
	}

	var req Req
	ct := c.Request.Header.Get("Content-Type")
	if strings.HasPrefix(ct, "multipart/form-data") {
		if err := c.ShouldBindWith(&req, binding.FormMultipart); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad form-data", "detail": err.Error()})
			return
		}
	} else {
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "bad json", "detail": err.Error()})
			return
		}
	}

	// -------- map เฉพาะฟิลด์ที่ส่งมา --------
	if req.TitleID != nil {
		en.TitleID = *req.TitleID
	}
	if req.TFirstName != nil {
		en.TFirst_Name = *req.TFirstName
	}
	if req.TLastName != nil {
		en.TLast_Name = *req.TLastName
	}
	if req.EFirstName != nil {
		en.EFirst_Name = *req.EFirstName
	}
	if req.ELastName != nil {
		en.ELast_Name = *req.ELastName
	}
	if req.CitizenID != nil {
		en.Citizen_ID = *req.CitizenID
	}
	if req.Tel != nil {
		en.Tel = *req.Tel
	}
	if req.GenderID != nil {
		en.GenderID = *req.GenderID
	}
	if req.Nationality != nil {
		en.Nationality = *req.Nationality
	}
	if req.Email != nil {
		en.Email = *req.Email
	}
	if req.Address != nil {
		en.Address = *req.Address
	}
	if req.Guardian != nil {
		en.Guardian = *req.Guardian
	}
	if req.GradeYear != nil {
		en.Grade_Year = *req.GradeYear
	}
	if req.GradeClass != nil {
		en.Grade_Class = *req.GradeClass
	}
	if req.AdminID != nil {
		en.AdminID = *req.AdminID
	}
	if req.Religious != nil {
		// อนุญาตให้ส่ง "" เพื่อล้างค่า
		if strings.TrimSpace(*req.Religious) == "" {
			en.Religious = nil
		} else {
			en.Religious = req.Religious
		}
	}
	if req.Status != nil {
		// ถ้าต้องการจำกัดค่าที่รับ ให้ตรวจสอบที่นี่
		// allowed := map[string]bool{"waiting":true, "completed":true, "unsuccessful":true, "cancel":true}
		// if !allowed[*req.Status] { ... }
		en.Status = *req.Status
	}

	// วันเกิด + อายุ
	if req.DateOfBirth != nil && strings.TrimSpace(*req.DateOfBirth) != "" {
		dob, err := time.Parse("2006-01-02", *req.DateOfBirth)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "date_of_birth must be YYYY-MM-DD"})
			return
		}
		en.DateOfBirth = dob
		// คำนวณอายุใหม่ หาก client ไม่ได้ส่ง age มาเอง
		if req.Age == nil {
			en.Age = calcAge(dob, time.Now())
		}
	}
	if req.Age != nil {
		en.Age = *req.Age
	}

	// -------- อัปโหลดไฟล์ (เฉพาะกรณี multipart และส่งไฟล์มา) --------
	if strings.HasPrefix(ct, "multipart/form-data") {
		// ปพ.1
		if p, err := saveUploadedEnrollment(c, "transcript_of_records", "uploads/transcripts"); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "upload transcript_of_records failed", "detail": err.Error()})
			return
		} else if p != "" {
			safeRemoveEnrollment(en.Transcript_of_Records)
			en.Transcript_of_Records = p
		}
		// สำเนาทะเบียนบ้าน
		if p, err := saveUploadedEnrollment(c, "household_registration_certificate", "uploads/households"); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "upload household_registration_certificate failed", "detail": err.Error()})
			return
		} else if p != "" {
			safeRemoveEnrollment(en.Household_Registration_Certificate)
			en.Household_Registration_Certificate = p
		}
		// สำเนาบัตรประชาชน
		if p, err := saveUploadedEnrollment(c, "copy_citizen_id", "uploads/citizens"); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "upload copy_citizen_id failed", "detail": err.Error()})
			return
		} else if p != "" {
			safeRemoveEnrollment(en.Copy_Citizen_ID)
			en.Copy_Citizen_ID = p
		}
		// รูปนักเรียน
		if p, err := saveUploadedEnrollment(c, "student_image", "uploads/images"); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "upload student_image failed", "detail": err.Error()})
			return
		} else if p != "" {
			safeRemoveEnrollment(en.Student_image)
			en.Student_image = p
		}
	}

	if err := config.DB().Save(&en).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "updated", "enrollment": en})
}

func CheckEnrollmentStatus(c *gin.Context) {
    cid := strings.TrimSpace(c.Query("citizen_id"))
    cid = strings.ReplaceAll(cid, " ", "")
    cid = strings.ReplaceAll(cid, "-", "")

    if cid == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "missing citizen_id"})
        return
    }

    // ถ้ามีหลายแถว ใช้แถวล่าสุด
    var e entity.Enrollment
    err := config.DB().
        Where("citizen_id = ?", cid).
        Order("created_at DESC").
        First(&e).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }

    status := strings.TrimSpace(e.Status)
    if status == "" {
        status = "waiting"
    }

    // mapping คำไทย (ปรับได้ตามที่ใช้จริง)
    toTH := map[string]string{
        "waiting":      "รอพิจารณา",
        "completed":    "ผ่านการคัดเลือก",
        "unsuccessful": "ไม่ผ่านการคัดเลือก",
        "cancel":       "ยกเลิก",
    }
    th := toTH[status]
    if th == "" {
        th = status
    }

    c.JSON(http.StatusOK, gin.H{
        "full_name":   e.TFirst_Name + " " + e.TLast_Name,
        "citizen_id":  e.Citizen_ID,
        "status":      status,
        "status_text": th,
        "grade_year":  e.Grade_Year,
        "grade_class": e.Grade_Class,
        "submitted_at": e.CreatedAt.Format(time.RFC3339),
    })
}