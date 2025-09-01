package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)

// post /บันทึกข้อมูลลงฐานข้อมูล
type gradeInput struct {
		entity.Schedules
		GradeYear  string `json:"grade_year"`
		GradeClass int    `json:"grade_class"`
}
func CreateSchedule(c *gin.Context) {
	var input gradeInput


	// Bind JSON input เข้ากับ struct
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ ตรวจสอบ grade_year, grade_class
	if input.GradeYear == "" || input.GradeClass == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ grade_year และ grade_class"})
		return
	}

	// 🔍 ค้นหา Grade ID
	var grade entity.Grade
	if err := config.DB().
		Where("grade_year = ? AND grade_class = ?", input.GradeYear, input.GradeClass).
		First(&grade).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบระดับชั้นนี้ในระบบ"})
		return
	}

	// สร้าง schedule object ด้วย GradeID ที่ได้
	schedule := input.Schedules
	schedule.GradeID = grade.ID

	// ตรวจสอบความครบถ้วน
	if schedule.CourseID == 0 || schedule.DayID == 0 || schedule.TeacherID == 0 ||
		schedule.TimeStartID == 0 || schedule.TimeEndID == 0 || schedule.TermID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ครบ"})
		return
	}

	// 🔨 save ลง database
	if err := config.DB().Create(&schedule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกตารางเรียนได้"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": schedule})
}

// get
type ScheduleResponse struct {
	Day         	string  	`json:"day"`
	StartTime   	string  	`json:"start_time"`
	EndTime     	string  	`json:"end_time"`
	CourseName  	string  	`json:"course"`
	CourseCode  	string  	`json:"course_code"`
	CreditNum   	float32 	`json:"credit_num"`
	ClassInWeek 	int     	`json:"class_in_week"`
	HoursOfTerm 	int     	`json:"hours_of_term"`
	Subject_Group 	string 		`json:"subject_group"` 
	Teacher     	string  	`json:"teacher"`
	GradeYeaer  	string  	`json:"grade_year"`
	Grade_Class 	int     	`josn:"grade_class"`
}

func GetSchedulesByID(c *gin.Context) {
	var schedules []entity.Schedules
	var responses []ScheduleResponse

	// รับค่า query parameters
	gradeID := c.Query("grade")
	classID := c.Query("class")
	termID := c.Query("term")

	// ตรวจสอบว่าครบทุกพารามิเตอร์หรือไม่
	if gradeID == "" || termID == "" || classID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ grade, class และ term"})
		return
	}

	// ดึงข้อมูลจากฐานข้อมูล พร้อม Preload ตารางที่เกี่ยวข้อง
	if err := config.DB().
		Joins("JOIN grades ON grades.id = schedules.grade_id").
		Preload("Day").
		Preload("Course").
		Preload("Course.Subject_Group").
		Preload("Teacher").
		Preload("TimeStart").
		Preload("TimeEnd").
		Preload("Grade").
		Preload("Term").
		Where("grades.grade_year = ? AND grades.grade_class = ? AND schedules.term_id = ?", gradeID, classID, termID).
		Find(&schedules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// map -> response struct
	for _, s := range schedules {

		subjectGroupName := ""
		if s.Course != nil && s.Course.Subject_Group != nil {
			subjectGroupName = s.Course.Subject_Group.SubjectGroup_Name
		}
		fmt.Print(s.Course.Subject_Group)
		res := ScheduleResponse{
			Day:         	s.Day.ThaiDay,
			StartTime:   	s.TimeStart.Period,
			EndTime:     	s.TimeEnd.Period,
			CourseName:  	s.Course.Course_Name,
			CourseCode: 	s.Course.Course_Code,
			CreditNum:   	s.Course.Credit_Num,
			ClassInWeek: 	s.Course.Class_in_week,
			HoursOfTerm: 	s.Course.Hours_of_term,
			Subject_Group: 	subjectGroupName,
			GradeYeaer:  	s.Grade.Grade_Year,
			Grade_Class: 	s.Grade.Grade_Class,
			Teacher:     	s.Teacher.Title.TitleTH + " " + s.Teacher.TFirst_Name + " " + s.Teacher.TLast_Name,
		}
		responses = append(responses, res)
	}
	// ส่งข้อมูลกลับไปยัง frontend
	c.JSON(http.StatusOK, gin.H{"data": responses})
}
