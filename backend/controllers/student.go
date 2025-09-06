package controllers

import (
	"encoding/base64"
	"errors"
	"sort"
    "sync"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"gorm.io/gorm"
)
type NameOnly struct {
    Student_ID string `json:"student_id"`
    TFirst_Name string `json:"t_first_name"`
    TLast_Name  string `json:"t_last_name"`
}

func GetStudentAllById(c *gin.Context) {
	id := c.Param("user_id") // รับ ID จาก URL param เช่น /students/:id
	var student entity.Student
	if err := config.DB().First(&student, "users_id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบนักเรียนที่มี ID นี้"})
		return
	}
	c.JSON(http.StatusOK, student)
}

// // GET /NameStudent/:id
// func GetNameStudentById(c *gin.Context) {
// 	var name NameOnly
// 	id := c.Param("id")

// 	if err := config.DB().Table("students").
// 		Select("student_id,t_first_name, t_last_name").
// 		Where("users_id = ?", id).
// 		Scan(&name).Error; err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "student not found"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, name)
// }
type keyLocker struct {
	mu    sync.Mutex
	locks map[string]*sync.Mutex
}

func newKeyLocker() *keyLocker {
	return &keyLocker{locks: make(map[string]*sync.Mutex)}
}

// จองล็อกตามรายการคีย์ (เรียงก่อนเพื่อกัน deadlock) และคืนฟังก์ชัน unlock
func (kl *keyLocker) Lock(keys ...string) func() {
	sort.Strings(keys)
	kl.mu.Lock()
	mtxs := make([]*sync.Mutex, 0, len(keys))
	for _, k := range keys {
		m, ok := kl.locks[k]
		if !ok {
			m = &sync.Mutex{}
			kl.locks[k] = m
		}
		mtxs = append(mtxs, m)
	}
	kl.mu.Unlock()

	for _, m := range mtxs {
		m.Lock()
	}
	// ปลดล็อกย้อนลำดับ
	return func() {
		for i := len(mtxs) - 1; i >= 0; i-- {
			mtxs[i].Unlock()
		}
	}
}

// ตัวแปรล็อกระดับแพ็กเกจ (ใช้ซ้ำได้ทุก handler)
var studentKeyLock = newKeyLocker()

type AddStudentReq struct {
	StudentID    string    `json:"student_id" binding:"required"`
	TitleID      uint      `json:"title_id"  binding:"required"`
	TFirstName   string    `json:"t_first_name" binding:"required"`
	TLastName    string    `json:"t_last_name"  binding:"required"`
	EFirstName   string    `json:"e_first_name"`
	ELastName    string    `json:"e_last_name"`
	CitizenID    string    `json:"citizen_id" binding:"required,len=13"`
	Tel          string    `json:"tel"`
	DateOfBirth  string     `json:"date_of_birth" binding:"required"`
	Gender       string    `json:"gender"` // รับเป็น string แล้วค่อยแปลง
	Nationality  string    `json:"nationality"`
	Email        string    `json:"email"`
	Religious    string    `json:"religious"`
	StudentImage string    `json:"student_image"` // ✅ data URL หรือ base64 ล้วน
	UsersID      uint      `json:"users_id"`
	AddressID    uint      `json:"address_id"`
	GradeID      uint      `json:"grade_id"`
}

func toGenderType(s string) entity.Gendertype {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "ชาย", "male", "m":
		return entity.Gendertype("ชาย")
	case "หญิง", "female", "f":
		return entity.Gendertype("หญิง")
	default:
		return entity.Gendertype("ไม่ระบุ")
	}
}

// ตัด prefix ถ้าเป็น data URL แล้ว base64-decode
func decodeImageBase64(s string) ([]byte, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil, nil
	}
	// data:image/png;base64,AAAA.... → ตัดส่วนหัวออก
	if i := strings.Index(s, ","); i != -1 && strings.Contains(s[:i], "base64") {
		s = s[i+1:]
	}
	b, err := base64.StdEncoding.DecodeString(s)
	if err != nil {
		return nil, err
	}
	return b, nil
}



func AddStudent(c *gin.Context) {
  var payload AddStudentReq
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // parse YYYY-MM-DD → time.Time
    dob, err := time.Parse("2006-01-02", strings.TrimSpace(payload.DateOfBirth))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "date_of_birth must be YYYY-MM-DD"})
        return
    }

    // normalize
    sid     := strings.TrimSpace(payload.StudentID)
    citizen := strings.TrimSpace(payload.CitizenID)
    email   := strings.ToLower(strings.TrimSpace(payload.Email))

    img, err := decodeImageBase64(payload.StudentImage)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid student_image (must be base64 or data URL)"})
        return
    }

    db := config.DB()
    tx := db.Begin()
    if tx.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot start transaction"})
        return
    }

    // panic safety
    defer func() {
        if r := recover(); r != nil {
            // ปล่อยล็อกให้หมดก่อน
            // (ไม่มี acquired ที่นี่เพราะเราจะเก็บไว้ใน scope ข้างล่าง)
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "panic recovered"})
        }
    }()

    // ---------- 🔒 จองล็อกในโปรเซส (แทน GET_LOCK) ----------
    	keys := []string{
		"students:student_id:" + sid,
		"students:citizen_id:" + citizen,
	}
	if email != "" {
		keys = append(keys, "students:email:"+email)
	}
	unlock := studentKeyLock.Lock(keys...)
	defer unlock()
	// -------------------------------------------------------

	db = config.DB()
	tx = db.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot start transaction"})
		return
	}

    // --- 2) เช็กซ้ำภายใต้ tx เดียวกัน ---
    var tmp entity.Student

	if err := tx.Where("student_id = ?", sid).First(&tmp).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}
	} else {
		tx.Rollback()
		c.JSON(http.StatusConflict, gin.H{"error": "student_id already exists"})
		return
	}

	if err := tx.Where("citizen_id = ?", citizen).First(&tmp).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}
	} else {
		tx.Rollback()
		c.JSON(http.StatusConflict, gin.H{"error": "citizen_id already exists"})
		return
	}

	if email != "" {
		if err := tx.Where("email = ?", email).First(&tmp).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
				return
			}
		} else {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
			return
		}
	}


    // --- 3) Create ---
    s := entity.Student{
        Student_ID:    sid,
        TitleID:       payload.TitleID,
        TFirst_Name:   payload.TFirstName,
        TLast_Name:    payload.TLastName,
        EFirst_Name:   payload.EFirstName,
        ELast_Name:    payload.ELastName,
        Citizen_ID:    citizen,
        Tel:           payload.Tel,
        DateOfBirth:   dob,
        Gender:        toGenderType(payload.Gender),
        Nationality:   payload.Nationality,
        Email:         email, // ใช้ตัว normalize
        Religious:     payload.Religious,
        Student_image: img,
        UsersID:       payload.UsersID,
        AddressID:     payload.AddressID,
        GradeID:       payload.GradeID,
    }

 	if err := tx.Create(&s).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed"})
		return
	}

    c.JSON(http.StatusCreated, gin.H{"data": gin.H{
        "id":            s.ID,
        "student_id":    s.Student_ID,
        "title_id":      s.TitleID,
        "t_first_name":  s.TFirst_Name,
        "t_last_name":   s.TLast_Name,
        "e_first_name":  s.EFirst_Name,
        "e_last_name":   s.ELast_Name,
        "citizen_id":    s.Citizen_ID,
        "tel":           s.Tel,
        "date_of_birth": s.DateOfBirth.Format("2006-01-02"),
        "gender":        s.Gender,
        "nationality":   s.Nationality,
        "email":         s.Email,
        "religious":     s.Religious,
        "users_id":      s.UsersID,
        "address_id":    s.AddressID,
        "grade_id":      s.GradeID,
        "created_at":    s.CreatedAt,
        "updated_at":    s.UpdatedAt,
    }})
}

type UpdateStudentReq struct {
	TitleID      *uint     `json:"title_id"`
	TFirstName   *string   `json:"t_first_name"`
	TLastName    *string   `json:"t_last_name"`
	EFirstName   *string   `json:"e_first_name"`
	ELastName    *string   `json:"e_last_name"`
	CitizenID    *string   `json:"citizen_id"`
	Tel          *string   `json:"tel"`
	DateOfBirth  *time.Time `json:"date_of_birth" time_format:"2006-01-02"`
	Gender       *string   `json:"gender"`
	Nationality  *string   `json:"nationality"`
	Email        *string   `json:"email"`
	Religious    *string   `json:"religious"`
	StudentImage *string   `json:"student_image"` // nil = ไม่แตะ, "" = ล้างรูป, อื่นๆ = ใส่ใหม่
	UsersID      *uint     `json:"users_id"`
	AddressID    *uint     `json:"address_id"`
	GradeID      *uint     `json:"grade_id"`
}

func UpdateStudent(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var s entity.Student
	if err := db.First(&s, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var req UpdateStudentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}

	if req.TitleID != nil { updates["title_id"] = *req.TitleID }
	if req.TFirstName != nil { updates["t_first_name"] = *req.TFirstName }
	if req.TLastName != nil  { updates["t_last_name"]  = *req.TLastName }
	if req.EFirstName != nil { updates["e_first_name"] = *req.EFirstName }
	if req.ELastName != nil  { updates["e_last_name"]  = *req.ELastName }
	if req.CitizenID != nil  { updates["citizen_id"]   = *req.CitizenID }
	if req.Tel != nil        { updates["tel"]          = *req.Tel }
	if req.DateOfBirth != nil{ updates["date_of_birth"]= *req.DateOfBirth }
	if req.Gender != nil     { updates["gender"]       = toGenderType(*req.Gender) }
	if req.Nationality != nil{ updates["nationality"]  = *req.Nationality }
	if req.Email != nil      { updates["email"]        = *req.Email }
	if req.Religious != nil  { updates["religious"]    = *req.Religious }
	if req.UsersID != nil    { updates["users_id"]     = *req.UsersID }
	if req.AddressID != nil  { updates["address_id"]   = *req.AddressID }
	if req.GradeID != nil    { updates["grade_id"]     = *req.GradeID }

	if req.StudentImage != nil {
		if strings.TrimSpace(*req.StudentImage) == "" {
			updates["student_image"] = []byte(nil) // ล้างรูป
		} else {
			img, err := decodeImageBase64(*req.StudentImage)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid student_image (must be base64 or data URL)"})
				return
			}
			updates["student_image"] = img
		}
	}

	if len(updates) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": s})
		return
	}

	if err := db.Model(&s).Updates(updates).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": s})
}

func GetStudentImage(c *gin.Context) {
	id := c.Param("id")
	var s entity.Student
	if err := config.DB().Select("student_image").First(&s, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if len(s.Student_image) == 0 {
		c.Status(http.StatusNoContent)
		return
	}

	ctype := http.DetectContentType(s.Student_image) // เดา content-type
	c.Header("Content-Type", ctype)
	c.Header("Cache-Control", "public, max-age=3600")
	c.Data(http.StatusOK, ctype, s.Student_image)
}


