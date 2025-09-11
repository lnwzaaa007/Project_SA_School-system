package controllers

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// ---------- helpers ----------
func parseDatePtr(yyyyMMDD *string) (*time.Time, error) {
	if yyyyMMDD == nil || strings.TrimSpace(*yyyyMMDD) == "" {
		return nil, nil
	}
	t, err := time.Parse("2006-01-02", strings.TrimSpace(*yyyyMMDD))
	if err != nil {
		return nil, err
	}
	return &t, nil
}
func normalizeRelation(s string) string {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "father":
		return "father"
	case "mother":
		return "mother"
	case "guardian":
		return "guardian"
	default:
		return strings.ToLower(strings.TrimSpace(s))
	}
}

// ---------- DTO ----------
type personReq struct {
	CitizenID string  `json:"citizen_id"`   // -> Guardian.G_nationID
	TitleID   *uint   `json:"title_id"`     // -> Guardian.TitleID
	FirstName string  `json:"first_name"`   // -> Guardian.G_TFirst_Name
	LastName  string  `json:"last_name"`    // -> Guardian.G_TLast_Name
	Tel       string  `json:"tel"`          // -> Guardian.G_Tel
	Job       string  `json:"job"`          // -> Guardian.G_job
	DOB       *string `json:"dob"`          // YYYY-MM-DD -> Guardian.G_DateOfBirth
	Status    string  `json:"status"`       // -> Guardian.G_status
	Relation  string  `json:"relation,omitempty"`
}
type createGuardianProfileReq struct {
	StudentID  uint       `json:"student_id" binding:"required"`
	LivingWith string     `json:"living_with"` // "parents" | "guardian"
	Father     *personReq `json:"father"`
	Mother     *personReq `json:"mother"`
	Guardian   *personReq `json:"guardian"`
}
type GuardianItemView struct {
	ID         uint      `json:"id"`           // id ของ GuardianStudent (link)
	Relation   string    `json:"relation"`     // father | mother | guardian
	GuardianID uint      `json:"guardian_id"`
	StudentID  uint      `json:"student_id"`

	CitizenID string  `json:"citizen_id"`
	TitleID   uint    `json:"title_id"`
	FirstName string  `json:"first_name"`
	LastName  string  `json:"last_name"`
	Tel       string  `json:"tel"`
	Job       string  `json:"job"`
	DOB       *string `json:"dob"`     // YYYY-MM-DD
	Status    string  `json:"status"`  // มีชีวิต/เสียชีวิต/ติดต่อไม่ได้

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func toGuardianItemView(gs entity.GuardianStudent, g entity.Guardian) GuardianItemView {
	var dobStr *string
	if !g.G_DateOfBirth.IsZero() {
		s := g.G_DateOfBirth.Format("2006-01-02")
		dobStr = &s
	}
	return GuardianItemView{
		ID:         gs.ID,
		Relation:   gs.Relation,
		GuardianID: g.ID,
		StudentID:  gs.StudentID,

		CitizenID: g.G_nationID,
		TitleID:   g.TitleID,
		FirstName: g.G_TFirst_Name,
		LastName:  g.G_TLast_Name,
		Tel:       g.G_Tel,
		Job:       g.G_job,
		DOB:       dobStr,
		Status:    g.G_status,

		CreatedAt: gs.CreatedAt,
		UpdatedAt: gs.UpdatedAt,
	}
}

// ---------- core (สร้าง/แทนที่ 1 บทบาท) ----------
func upsertOneGuardianTX(tx *gorm.DB, stuID uint, relation string, p *personReq) (entity.GuardianStudent, error) {
	relation = normalizeRelation(relation)
	if p == nil {
		return entity.GuardianStudent{}, nil
	}

	// หา/สร้าง Guardian จาก citizen_id
	var g entity.Guardian
	if strings.TrimSpace(p.CitizenID) != "" {
		if err := tx.Where("g_nation_id = ?", strings.TrimSpace(p.CitizenID)).First(&g).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return entity.GuardianStudent{}, err
			}
		}
	}
	if g.ID == 0 {
		g = entity.Guardian{}
	}
	// map fields
	g.G_nationID = strings.TrimSpace(p.CitizenID)
	if p.TitleID != nil {
		g.TitleID = *p.TitleID
	}
	g.G_TFirst_Name = strings.TrimSpace(p.FirstName)
	g.G_TLast_Name = strings.TrimSpace(p.LastName)
	g.G_Tel = strings.TrimSpace(p.Tel)
	g.G_job = strings.TrimSpace(p.Job)
	g.G_status = strings.TrimSpace(p.Status)
	if dob, err := parseDatePtr(p.DOB); err != nil {
		return entity.GuardianStudent{}, err
	} else if dob != nil {
		g.G_DateOfBirth = *dob
	}

	// save (create/update)
	if g.ID == 0 {
		if err := tx.Create(&g).Error; err != nil {
			return entity.GuardianStudent{}, err
		}
	} else {
		if err := tx.Save(&g).Error; err != nil {
			return entity.GuardianStudent{}, err
		}
	}

	// ลบ link เดิมของบทบาทนี้ (ให้มีได้ 1 แถว/บทบาท/นักเรียน)
	if err := tx.Where("student_id = ? AND relation = ?", stuID, relation).
		Delete(&entity.GuardianStudent{}).Error; err != nil {
		return entity.GuardianStudent{}, err
	}

	// สร้าง link ใหม่ (ไม่ใช้/ไม่ตั้งค่า GuardianStdent_status)
	gs := entity.GuardianStudent{
		GuardianID: g.ID,
		StudentID:  stuID,
		Relation:   relation,
	}
	if err := tx.Create(&gs).Error; err != nil {
		return entity.GuardianStudent{}, err
	}
	return gs, nil
}

// ---------- handlers ----------

// POST /guardian-student
func CreateGuardianProfile(c *gin.Context) {
	var req createGuardianProfileReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	// ตรวจว่านักเรียนมีจริง
	var s entity.Student
	if err := db.Select("id").First(&s, req.StudentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "student not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	tx := db.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot start transaction"})
		return
	}

	out := make([]GuardianItemView, 0, 3)
	addOne := func(rel string, p *personReq) error {
		gs, err := upsertOneGuardianTX(tx, req.StudentID, rel, p)
		if err != nil || gs.ID == 0 {
			return err
		}
		var g entity.Guardian
		if err := tx.First(&g, gs.GuardianID).Error; err != nil {
			return err
		}
		out = append(out, toGuardianItemView(gs, g))
		return nil
	}

	if req.Father != nil {
		if err := addOne("father", req.Father); err != nil { tx.Rollback(); c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
	}
	if req.Mother != nil {
		if err := addOne("mother", req.Mother); err != nil { tx.Rollback(); c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
	}
	// ถ้าต้องการให้ guardian ส่งมาได้เสมอ ก็เอาเงื่อนไข living_with ออก
	if strings.ToLower(strings.TrimSpace(req.LivingWith)) == "guardian" && req.Guardian != nil {
		if err := addOne("guardian", req.Guardian); err != nil { tx.Rollback(); c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": out})
}

// GET /guardian-student?student_id=123
func ListGuardiansByStudent(c *gin.Context) {
	stuID := strings.TrimSpace(c.Query("student_id"))
	if stuID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "student_id is required"})
		return
	}

	var links []entity.GuardianStudent
	if err := config.DB().
		Preload("Guardian").
		Where("student_id = ?", stuID).
		Order("id ASC").
		Find(&links).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	views := make([]GuardianItemView, 0, len(links))
	for _, l := range links {
		if l.Guardian != nil {
			views = append(views, toGuardianItemView(l, *l.Guardian))
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": views})
}

// GET /guardian-student/:id
func GetGuardianLinkByID(c *gin.Context) {
	var gs entity.GuardianStudent
	if err := config.DB().
		Preload("Guardian").
		First(&gs, c.Param("id")).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	if gs.Guardian == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "guardian not loaded"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toGuardianItemView(gs, *gs.Guardian)})
}

type updateGuardianLinkReq struct {
	// เปลี่ยนบทบาทของลิงก์ (ถ้าต้องการ)
	Relation *string `json:"relation"`

	// อัปเดตข้อมูลบุคคล
	CitizenID *string `json:"citizen_id"`
	TitleID   *uint   `json:"title_id"`
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
	Tel       *string `json:"tel"`
	Job       *string `json:"job"`
	DOB       *string `json:"dob"`    // YYYY-MM-DD
	Status    *string `json:"status"` // มีชีวิต/เสียชีวิต/ติดต่อไม่ได้
}

// PUT /guardian-student/:id
func UpdateGuardianLink(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var gs entity.GuardianStudent
	if err := db.Preload("Guardian").First(&gs, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	if gs.Guardian == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "guardian fetch error"})
		return
	}
	g := gs.Guardian

	var req updateGuardianLinkReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := db.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot start transaction"})
		return
	}

	// อัปเดตบทบาทความสัมพันธ์ (ถ้ามี)
	if req.Relation != nil {
		newRel := normalizeRelation(*req.Relation)
		// ให้คงกฎ “1 บทบาท/นักเรียน มีได้ 1 แถว” โดยลบอันเดิมของบทบาทนั้นก่อน
		if err := tx.Where("student_id = ? AND relation = ?", gs.StudentID, newRel).
			Where("id <> ?", gs.ID).
			Delete(&entity.GuardianStudent{}).Error; err != nil {
			tx.Rollback(); c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return
		}
		if err := tx.Model(&gs).Update("relation", newRel).Error; err != nil {
			tx.Rollback(); c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return
		}
	}

	// อัปเดตข้อมูลผู้ปกครอง
	guardUpd := map[string]any{}
	if req.CitizenID != nil { guardUpd["g_nation_id"] = strings.TrimSpace(*req.CitizenID) }
	if req.TitleID != nil   { guardUpd["title_id"] = *req.TitleID }
	if req.FirstName != nil { guardUpd["g_t_first_name"] = strings.TrimSpace(*req.FirstName) }
	if req.LastName != nil  { guardUpd["g_t_last_name"]  = strings.TrimSpace(*req.LastName) }
	if req.Tel != nil       { guardUpd["g_tel"]          = strings.TrimSpace(*req.Tel) }
	if req.Job != nil       { guardUpd["g_job"]          = strings.TrimSpace(*req.Job) }
	if req.Status != nil    { guardUpd["g_status"]       = strings.TrimSpace(*req.Status) }
	if req.DOB != nil {
		if strings.TrimSpace(*req.DOB) == "" {
			guardUpd["g_date_of_birth"] = time.Time{}
		} else if t, err := time.Parse("2006-01-02", strings.TrimSpace(*req.DOB)); err == nil {
			guardUpd["g_date_of_birth"] = t
		} else {
			tx.Rollback(); c.JSON(http.StatusBadRequest, gin.H{"error": "dob must be YYYY-MM-DD"}); return
		}
	}
	if len(guardUpd) > 0 {
		if err := tx.Model(g).Updates(guardUpd).Error; err != nil {
			tx.Rollback(); c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed"})
		return
	}

	// reload
	if err := db.Preload("Guardian").First(&gs, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "reload failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toGuardianItemView(gs, *gs.Guardian)})
}

// DELETE /guardian-student/:id  (ลบเฉพาะ link ไม่ลบ Guardian)
func DeleteGuardianLink(c *gin.Context) {
	if err := config.DB().Delete(&entity.GuardianStudent{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
