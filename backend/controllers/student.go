package controllers

import (
	"encoding/base64"
	"errors"
	"sort"
    "sync"
	"net/http"
	"strings"
	"time"
	"fmt" 
	"strconv"
	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	"gorm.io/gorm"
    "golang.org/x/crypto/bcrypt" //mag เพิ่มตรงนี้ด้วย <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<,
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

    // ---------- จองล็อกในโปรเซส (แทน GET_LOCK) ----------
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

	//mag เวลาเพิ่ม studenะ ให้เพิ่ม user auto <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // --- 3) Optionally create Users record for login ---
    var userID uint = payload.UsersID
    if userID == 0 {
        // Find UserType for Student (prefer by name, fallback by prefix)
        var ut entity.UserType
        if err := tx.Where("user_type_name = ?", "Student").First(&ut).Error; err != nil {
            if errors.Is(err, gorm.ErrRecordNotFound) {
                if err2 := tx.Where("user_type_prefix = ?", "S").First(&ut).Error; err2 != nil {
                    tx.Rollback()
                    c.JSON(http.StatusBadRequest, gin.H{"error": "cannot find Student user type"})
                    return
                }
            } else {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
                return
            }
        }

        // Default username = student_id, default password = citizen_id (or 123456 if empty)
        defaultPwd := citizen
        if defaultPwd == "" {
            defaultPwd = "123456"
        }
        hashed, err := bcrypt.GenerateFromPassword([]byte(defaultPwd), 14)
        if err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "password hash failed"})
            return
        }

        u := entity.Users{
            Username:  sid,
            Password:  string(hashed),
            UserTypeID: ut.ID,
        }
        if err := tx.Create(&u).Error; err != nil {
            // If duplicate username, report conflict clearly
            tx.Rollback()
            c.JSON(http.StatusConflict, gin.H{"error": "username already exists for another user"})
            return
        }
        userID = u.ID
    }
	//mag แก้ถึงตรงนี้ <<<<<<<<<<<<<<<<<<



    // --- 4) Create Student ---

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
        // UsersID:       payload.UsersID,
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
        // "users_id":      s.UsersID,
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
	DateOfBirth  *string `json:"date_of_birth" time_format:"2006-01-02"`
	Gender       *string   `json:"gender"`
	Nationality  *string   `json:"nationality"`
	Email        *string   `json:"email"`
	Religious    *string   `json:"religious"`
	StudentImage *string   `json:"student_image"` // nil = ไม่แตะ, "" = ล้างรูป, อื่นๆ = ใส่ใหม่
	// UsersID      *uint     `json:"users_id"`
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
	// if req.UsersID != nil    { updates["users_id"]     = *req.UsersID }
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
    if err := config.DB().
        Select("student_image, updated_at").
        First(&s, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
        return
    }
    if len(s.Student_image) == 0 {
        c.Status(http.StatusNoContent)
        return
    }

    // 304 If-Modified-Since
    if ims := c.GetHeader("If-Modified-Since"); ims != "" {
        if t, err := time.Parse(http.TimeFormat, ims); err == nil {
            if !s.UpdatedAt.After(t) {
                c.Status(http.StatusNotModified)
                return
            }
        }
    }

    ctype := http.DetectContentType(s.Student_image)
    c.Header("Content-Type", ctype)
    c.Header("Cache-Control", "public, max-age=3600")
    c.Header("Last-Modified", s.UpdatedAt.UTC().Format(http.TimeFormat))
    c.Data(http.StatusOK, ctype, s.Student_image)
}


// ใช้คืนค่ากับ FE — ไม่รวมรูปจริง (BLOB) เรียกดูคน
type StudentView struct {
    ID           uint              `json:"id"`
    StudentID    string            `json:"student_id"`
    TitleID      uint              `json:"title_id"`
    TFirstName   string            `json:"t_first_name"`
    TLastName    string            `json:"t_last_name"`
    EFirstName   string            `json:"e_first_name"`
    ELastName    string            `json:"e_last_name"`
    CitizenID    string            `json:"citizen_id"`
    Tel          string            `json:"tel"`
    DateOfBirth  string            `json:"date_of_birth"` // YYYY-MM-DD
    Gender       entity.Gendertype `json:"gender"`
    Nationality  string            `json:"nationality"`
    Email        string            `json:"email"`
    Religious    string            `json:"religious"`
    // UsersID      uint              `json:"users_id"`
    AddressID    uint              `json:"address_id"`
    GradeID      uint              `json:"grade_id"`
    CreatedAt    time.Time         `json:"created_at"`
    UpdatedAt    time.Time         `json:"updated_at"`

    HasImage     bool   `json:"has_image"`
    ImageURL     string `json:"image_url"` // relative: /students/:id/image
}

func toStudentView(s entity.Student) StudentView {
    return StudentView{
        ID: s.ID, StudentID: s.Student_ID, TitleID: s.TitleID,
        TFirstName: s.TFirst_Name, TLastName: s.TLast_Name,
        EFirstName: s.EFirst_Name, ELastName: s.ELast_Name,
        CitizenID: s.Citizen_ID, Tel: s.Tel,
        DateOfBirth: s.DateOfBirth.Format("2006-01-02"),
        Gender: s.Gender, Nationality: s.Nationality, Email: s.Email, Religious: s.Religious,
        AddressID: s.AddressID, GradeID: s.GradeID,
        CreatedAt: s.CreatedAt, UpdatedAt: s.UpdatedAt,
        HasImage: len(s.Student_image) > 0,
        ImageURL: fmt.Sprintf("/student/%d/image", s.ID),
    }
}

// GET /students?q=&user_id=&grade_id=&page=&page_size=
func ListStudents(c *gin.Context) {
    db := config.DB()

    q := strings.TrimSpace(c.Query("q"))
    gradeID := strings.TrimSpace(c.Query("grade_id"))

    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    if page < 1 { page = 1 }
    pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
    if pageSize <= 0 || pageSize > 100 { pageSize = 20 }

    base := db.Model(&entity.Student{})

    if q != "" {
        like := "%" + q + "%"
        base = base.Where(
            "student_id LIKE ? OR t_first_name LIKE ? OR t_last_name LIKE ? OR email LIKE ? OR citizen_id LIKE ?",
            like, like, like, like, like,
        )
    }
    if gradeID != "" {
        base = base.Where("grade_id = ?", gradeID)
    }

    var total int64
    if err := base.Count(&total).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // ไม่โหลด BLOB: คำนวณ has_image ด้วย LENGTH(student_image)
    type row struct {
        ID           uint
        Student_ID   string
        TitleID      uint
        TFirst_Name  string
        TLast_Name   string
        EFirst_Name  string
        ELast_Name   string
        Citizen_ID   string
        Tel          string
        DateOfBirth  time.Time
        Gender       entity.Gendertype
        Nationality  string
        Email        string
        Religious    string
        AddressID    uint
        GradeID      uint
        CreatedAt    time.Time
        UpdatedAt    time.Time
        HasImage     bool `gorm:"column:has_image"`
    }

    var rows []row
    if err := base.
        Select(`
            id, student_id, title_id, t_first_name, t_last_name, e_first_name, e_last_name,
            citizen_id, tel, date_of_birth, gender, nationality, email, religious,
            address_id, grade_id, created_at, updated_at,
            CASE WHEN student_image IS NOT NULL AND LENGTH(student_image) > 0 THEN 1 ELSE 0 END AS has_image
        `).
        Order("id ASC").
        Limit(pageSize).
        Offset((page-1)*pageSize).
        Find(&rows).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    views := make([]StudentView, 0, len(rows))
    for _, r := range rows {
        views = append(views, StudentView{
            ID: r.ID, StudentID: r.Student_ID, TitleID: r.TitleID,
            TFirstName: r.TFirst_Name, TLastName: r.TLast_Name,
            EFirstName: r.EFirst_Name, ELastName: r.ELast_Name,
            CitizenID: r.Citizen_ID, Tel: r.Tel,
            DateOfBirth: r.DateOfBirth.Format("2006-01-02"),
            Gender: r.Gender, Nationality: r.Nationality, Email: r.Email, Religious: r.Religious,
        	AddressID: r.AddressID, GradeID: r.GradeID,
            CreatedAt: r.CreatedAt, UpdatedAt: r.UpdatedAt,
            HasImage: r.HasImage,
            ImageURL: fmt.Sprintf("/student/%d/image", r.ID),
        })
    }

    c.JSON(http.StatusOK, gin.H{
        "data":      views,
        "page":      page,
        "page_size": pageSize,
        "total":     total,
    })
}

// GET /student/:id
func GetStudentByID(c *gin.Context) {
    id := c.Param("id")

    // ดึงแบบ select เฉพาะคอลัมน์ + คำนวณ has_image
    type row struct {
        ID           uint
        Student_ID   string
        TitleID      uint
        TFirst_Name  string
        TLast_Name   string
        EFirst_Name  string
        ELast_Name   string
        Citizen_ID   string
        Tel          string
        DateOfBirth  time.Time
        Gender       entity.Gendertype
        Nationality  string
        Email        string
        Religious    string
        AddressID    uint
        GradeID      uint
        CreatedAt    time.Time
        UpdatedAt    time.Time
        HasImage     bool `gorm:"column:has_image"`
    }
    var r row
    if err := config.DB().
        Table("students").
        Select(`
            id, student_id, title_id, t_first_name, t_last_name, e_first_name, e_last_name,
            citizen_id, tel, date_of_birth, gender, nationality, email, religious,
            address_id, grade_id, created_at, updated_at,
            CASE WHEN student_image IS NOT NULL AND LENGTH(student_image) > 0 THEN 1 ELSE 0 END AS has_image
        `).
        Where("id = ?", id).
        Take(&r).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    v := StudentView{
        ID: r.ID, StudentID: r.Student_ID, TitleID: r.TitleID,
        TFirstName: r.TFirst_Name, TLastName: r.TLast_Name,
        EFirstName: r.EFirst_Name, ELastName: r.ELast_Name,
        CitizenID: r.Citizen_ID, Tel: r.Tel,
        DateOfBirth: r.DateOfBirth.Format("2006-01-02"),
        Gender: r.Gender, Nationality: r.Nationality, Email: r.Email, Religious: r.Religious,
       	AddressID: r.AddressID, GradeID: r.GradeID,
        CreatedAt: r.CreatedAt, UpdatedAt: r.UpdatedAt,
        HasImage: r.HasImage,
        ImageURL: fmt.Sprintf("/students/%d/image", r.ID),
    }

    c.JSON(http.StatusOK, gin.H{"data": v})
}

func DeleteStudent(c *gin.Context) {
	id := c.Param("id")
	tx := config.DB().Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot start transaction"})
		return
	}

	// ตรวจว่ามีจริงไหม
	var s entity.Student
	if err := tx.First(&s, id).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		}
		return
	}

	// ----- ถ้ามีตารางลูก/ลิงก์ ให้ลบก่อน (ตัวอย่าง) -----
	if err := tx.Where("student_id = ?", s.ID).Delete(&entity.GuardianStudent{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ลบตัวนักเรียน
	if err := tx.Delete(&s).Error; err != nil {
		tx.Rollback()
		// จับ FK constraint
		if strings.Contains(strings.ToLower(err.Error()), "foreign key") {
			c.JSON(http.StatusConflict, gin.H{
				"error": "ไม่สามารถลบได้ เนื่องจากมีข้อมูลที่อ้างอิงอยู่ (foreign key constraint)",
			})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed"})
		return
	}
	c.Status(http.StatusNoContent)
}
