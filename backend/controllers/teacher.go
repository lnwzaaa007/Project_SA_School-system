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
    "golang.org/x/crypto/bcrypt" //mag เพิ่มตรงนี้ด้วย <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<,
    "gorm.io/gorm"
)
type NameOnlyTeacher struct {
    ID          uint   `json:"id"`
    Teacher_ID string `json:"teacher_id"`
	TFirst_Name string `json:"t_first_name"`
	TLast_Name  string `json:"t_last_name"`
    Qualification string `json:"qualification"`
	Teacher_image string `json:"teacher_image"`
    Status        string `json:"status"` // 👈 เพิ่ม
}

func GetNameTeacher(c *gin.Context) {
	var teacher []NameOnlyTeacher
	if err := config.DB().
        Raw("SELECT MIN(id) AS id, t_first_name,t_last_name,teacher_id,qualification,teacher_image,status FROM teachers WHERE deleted_at IS NULL  GROUP BY id ORDER BY id ASC").
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
    ct := c.Request.Header.Get("Content-Type")
    if !strings.HasPrefix(ct, "multipart/form-data") {
        // ไม่ใช่ multipart ก็ข้ามการอัปโหลดไฟล์ไปเฉย ๆ
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

    // --- Transaction for creating Users (optional) and Teacher ---
    tx := config.DB().Begin()
    if tx.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot start transaction"})
        return
    }
	//mag แก้ตรงนี้
    // Optionally create Users record for login
    var userID uint = req.UsersID
    if userID == 0 {
        // Find UserType for Teacher (prefer by name, fallback by prefix)
        var ut entity.UserType
        if err := tx.Where("user_type_name = ?", "Teacher").First(&ut).Error; err != nil {
            if errors.Is(err, gorm.ErrRecordNotFound) {
                if err2 := tx.Where("user_type_prefix = ?", "T").First(&ut).Error; err2 != nil {
                    tx.Rollback()
                    c.JSON(http.StatusBadRequest, gin.H{"error": "cannot find Teacher user type"})
                    return
                }
            } else {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
                return
            }
        }

        // Default username = teacher_id, default password = citizen_id (or 123456 if empty)
        defaultPwd := req.CitizenID
        if strings.TrimSpace(defaultPwd) == "" {
            defaultPwd = "123456"
        }
        hashed, err := bcrypt.GenerateFromPassword([]byte(defaultPwd), 14)
        if err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "password hash failed"})
            return
        }

        u := entity.Users{
            Username:   req.TeacherID,
            Password:   string(hashed),
            UserTypeID: ut.ID,
        }
        if err := tx.Create(&u).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusConflict, gin.H{"error": "username already exists for another user"})
            return
        }
        userID = u.ID
    }
	//ถึงตรงนี้
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
        UsersID:             userID,
    }

    if err := tx.Create(&t).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกข้อมูลไม่สำเร็จ", "detail": err.Error()})
        return
    }
	//mag เพิ่มตรงนี้
    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed"})
        return
    }
	//ถึงตรงนี้

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
    Status             string `json:"status"`
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
        Status            string
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
          t.status                     AS status,
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
        Status:             r.Status,
    }
    c.JSON(http.StatusOK, resp)
}


func GetTeacherDetail(c *gin.Context) {
	var teacher []TeacherDetailResponse
	if err := config.DB().
        Raw("SELECT teachers.*,addresses.* FROM teachers inner join addresses on teachers.address_id = addresses.id ").
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





// type TeacherUpdateRequest struct {
//     TeacherID     *string `form:"teacher_id"     json:"teacher_id"`
//     TitleID       *uint   `form:"title_id"       json:"title_id"`
//     TFirstName    *string `form:"t_first_name"   json:"t_first_name"`
//     TLastName     *string `form:"t_last_name"    json:"t_last_name"`
//     EFirstName    *string `form:"e_first_name"   json:"e_first_name"`
//     ELastName     *string `form:"e_last_name"    json:"e_last_name"`
//     CitizenID     *string `form:"citizen_id"     json:"citizen_id"`
//     Tel           *string `form:"tel"            json:"tel"`
//     DateOfBirth   *string `form:"date_of_birth"  json:"date_of_birth"` // YYYY-MM-DD
//     GenderID      *uint   `form:"gender_id"      json:"gender_id"`
//     Nationality   *string `form:"nationality"    json:"nationality"`
//     Email         *string `form:"email"          json:"email"`
//     Religious     *string `form:"religious"      json:"religious"`
//     Qualification *string `form:"qualification"  json:"qualification"`
//     AddressID     *uint   `form:"address_id"     json:"address_id"`
// }

// controllers/teacher.go
// PUT /teacher/:id
func UpdateTeacher(c *gin.Context) {
    id := c.Param("id")

    var t entity.Teacher
    if err := config.DB().First(&t, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "teacher not found"})
        return
    }

    // payload ใช้ pointer เพื่อรู้ว่า field ไหนถูกส่งมา
    type UpdateReq struct {
        TeacherID     *string `json:"teacher_id" form:"teacher_id"`
        TitleID       *uint   `json:"title_id" form:"title_id"`
        TFirstName    *string `json:"t_first_name" form:"t_first_name"`
        TLastName     *string `json:"t_last_name" form:"t_last_name"`
        EFirstName    *string `json:"e_first_name" form:"e_first_name"`
        ELastName     *string `json:"e_last_name" form:"e_last_name"`
        CitizenID     *string `json:"citizen_id" form:"citizen_id"`
        Tel           *string `json:"tel" form:"tel"`
        DateOfBirth   *string `json:"date_of_birth" form:"date_of_birth"` // YYYY-MM-DD
        GenderID      *uint   `json:"gender_id" form:"gender_id"`
        Nationality   *string `json:"nationality" form:"nationality"`
        Email         *string `json:"email" form:"email"`
        Religious     *string `json:"religious" form:"religious"`
        Qualification *string `json:"qualification" form:"qualification"`
        AddressID     *uint   `json:"address_id" form:"address_id"`
        Status 		   *string			`json:"status" form:"status"`
    }

    var req UpdateReq
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

    // map เฉพาะ field ที่ส่งมา
    if req.TeacherID != nil && strings.TrimSpace(*req.TeacherID) != "" {
        // (ถ้าต้องเช็คไม่ให้ซ้ำ / sync users.username ให้เพิ่ม logic ตรงนี้)
        t.Teacher_ID = *req.TeacherID
    }
    if req.TitleID != nil { t.TitleID = *req.TitleID }
    if req.TFirstName != nil { t.TFirst_Name = *req.TFirstName }
    if req.TLastName != nil  { t.TLast_Name  = *req.TLastName }
    if req.EFirstName != nil { t.EFirst_Name = *req.EFirstName }
    if req.ELastName != nil  { t.ELast_Name  = *req.ELastName }
    if req.CitizenID != nil  { t.Citizen_ID  = *req.CitizenID }
    if req.Tel != nil        { t.Tel         = *req.Tel }
    if req.GenderID != nil   { t.GenderID    = *req.GenderID }
    if req.Nationality != nil{ t.Nationality = *req.Nationality }
    if req.Email != nil      { t.Email       = *req.Email }
    if req.Religious != nil  { t.Religious   = *req.Religious }
    if req.Qualification != nil { t.Qualification = *req.Qualification }
    if req.AddressID != nil  { t.AddressID   = *req.AddressID }
    if req.Status != nil  { t.Status   = *req.Status }

    if req.DateOfBirth != nil && strings.TrimSpace(*req.DateOfBirth) != "" {
        dob, err := time.Parse("2006-01-02", *req.DateOfBirth)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "date_of_birth must be YYYY-MM-DD"})
            return
        }
        t.DateOfBirth = dob
    }

    // ถ้าเป็น multipart ค่อยเช็คไฟล์
    if strings.HasPrefix(ct, "multipart/form-data") {
        if newImg, err := saveUploadedFileOptional(c, "teacher_image", "uploads/teachers"); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "upload teacher_image failed", "detail": err.Error()})
            return
        } else if newImg != "" {
            safeRemove(t.Teacher_image)
            t.Teacher_image = newImg
        }

        if newQual, err := saveUploadedFileOptional(c, "qualification_image", "uploads/teacher_qualifications"); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "upload qualification_image failed", "detail": err.Error()})
            return
        } else if newQual != "" {
            safeRemove(t.Qualification_image)
            t.Qualification_image = newQual
        }
    }

    if err := config.DB().Save(&t).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed", "detail": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "updated", "teacher": t})
}

type gradeTeacher struct {
    ID        int     ` json:"id"`
	Grade_Year		string  ` json:"grade_year"`
	Grade_Class		int		` json:"grade_class"`
    Teacher         int     ` json:"teacher_id"`
}

func GetGradeTeacher(c *gin.Context) {
	var gradeTeacher []gradeTeacher
	if err := config.DB().
        Raw("SELECT grades.id, grade_year, grade_class FROM grades Order by id").
        Scan(&gradeTeacher).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, gradeTeacher)
}

func GetGradeTeacherById(c *gin.Context) {
	teacher := c.Param("id")
    var rows []gradeTeacher

    if err := config.DB().
        Table("grades").
        Select("*").
        Where("teacher_id = ?", teacher).
        Order("id ASC").
        Scan(&rows).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, rows)
}
func SetGradeHomeroomTeacher(c *gin.Context) {
	gid, err := strconv.Atoi(c.Param("id"))
	if err != nil || gid <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid grade id"})
		return
	}

	var req struct {
		TeacherID *uint `json:"teacher_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad json"})
		return
	}

	db := config.DB()

	// หา grade
	var grade entity.Grade
	if err := db.First(&grade, gid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "grade not found"})
		return
	}

	// ถ้าตั้งค่าเป็น nil = ถอดครูประจำชั้น
	if req.TeacherID == nil {
		if err := db.Model(&grade).Update("teacher_id", nil).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "updated", "grade_id": grade.ID, "teacher_id": nil})
		return
	}

	// ตรวจว่ามี teacher อยู่จริง
	var t entity.Teacher
	if err := db.First(&t, *req.TeacherID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "teacher not found"})
		return
	}

	// ถ้าครูคนนี้ถูกใช้เป็นครูประจำชั้นที่อื่นอยู่แล้ว -> 409
	var other entity.Grade
	if err := db.Where("teacher_id = ? AND id <> ?", *req.TeacherID, gid).First(&other).Error; err == nil {
		// รองรับ force=1 เพื่อย้ายครูจากชั้นเดิม (optional)
		if c.Query("force") == "1" {
			if err := db.Model(&other).Update("teacher_id", nil).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot unassign previous grade"})
				return
			}
		} else {
			c.JSON(http.StatusConflict, gin.H{
				"error":    "teacher already assigned to another grade",
				"grade_id": other.ID,
			})
			return
		}
	} else if err != nil && err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "check conflict failed"})
		return
	}

	// อัปเดต
	if err := db.Model(&grade).Update("teacher_id", *req.TeacherID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "updated",
		"grade_id":   grade.ID,
		"teacher_id": req.TeacherID,
	})
}
