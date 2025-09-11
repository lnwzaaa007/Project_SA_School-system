package controllers

import(
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
	
)
//post บันทึกข้อมูล
type CourseInput struct {
	ID				uint 	`json:"id"`
	Course_Code		string 	`json:"course_code" binding:"required"` 
	Course_Name		string 	`json:"course_name" binding:"required"`
	SubjectGroupID 	uint 	`json:"subject_group_id" binding:"required"`
	Credit_Num   	float32 `json:"credit_num" binding:"required"`
	Class_in_week 	int 	`json:"class_in_week"`
	Hours_of_term 	float32 `json:"hours_of_term"`
	GradeID			uint	`json:"grade_id"`
	Grade_Year		string 	`json:"grade_year" binding: "required"` 
	Grade_Class 	uint	`json:"grade_class" binding: "required"` 
	TermID 			uint 	`json:"term_id"`
	TeacherID		uint 	`json:"teacher_id" binding:"required"`
}
func CreateCourse(c *gin.Context) {
	var input CourseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบความครบถ้วน
	if input.Course_Code == "" || input.Course_Name == "" || input.SubjectGroupID == 0 ||
		input.Credit_Num == 0 {
		// || input.Grade_Year == "" || input.Grade_Class ==0 || input.TermID == 0 || input.TeacherID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ครบ"})
		return
	}
	// ตรวจสอบรหัสวิชาซ้ำ
	var existingCourse entity.Course
	if err := config.DB().Where("course_code = ?", input.Course_Code).First(&existingCourse).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสวิชานี้มีอยู่ในระบบแล้ว"})
		return
	}
	// ตรวจสอบชื่อวิชาซ้ำ
	var existingCourseName entity.Course
	if err := config.DB().Where("course_name = ?", input.Course_Name).First(&existingCourseName).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ชื่อวิชานี้มีอยู่ในระบบแล้ว"})
		return
	}	
	// ตรวจสอบกลุ่มวิชา
	var subjectGroup entity.Subject_Group
		
	if err := config.DB().Where("id = ?", input.SubjectGroupID).First(&subjectGroup).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบกลุ่มวิชานี้ในระบบ"})
		return
	}
	var grade entity.Grade
    if err := config.DB().Where("grade_year = ? AND grade_class = ?", input.Grade_Year, input.Grade_Class).First(&grade).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบข้อมูลระดับชั้นและห้องนี้ในระบบ"})
        return
    }
	// ตรวจสอบระดับชั้น
	// var grade entity.Grade
	// if err := config.DB().Where("grade_year = ?", input.Grade_Year).First(&grade).Error; err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบระดับชั้นนี้ในระบบ"})
	// 	return
	// }
	// if err := config.DB().Where("id = ?", input.Grade_Class).First(&grade).Error; err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบห้องในระบบนี้"})
	// }
	// // ตรวจสอบภาคเรียน
	// var term entity.Term
	// if err := config.DB().Where("id = ?", input.TermID).First(&term).Error; err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบภาคเรียนนี้ในระบบ"})
	// 	return
	// }
	// // ตรวจสอบอาจารย์ผู้สอน
	// var teacher entity.Teacher
	// if err := config.DB().Where("id = ?", input.TeacherID).First(&teacher).Error; err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบอาจารย์ผู้สอนนี้ในระบบ"})
	// 	return
	// }

	//บันทึกข้อมูลลง GradeID


	//คำนวณจำนวนชั่วโมงเรียนต่อเทอม
	hourOfTerm := int(input.Credit_Num * 40.0)
	//การ map ข้อมูล
	course := entity.Course{
		Course_Code:   input.Course_Code,
		Course_Name:   input.Course_Name,
		Credit_Num:    input.Credit_Num,
		Class_in_week: input.Class_in_week,
		Hours_of_term: hourOfTerm,
		SubjectGroupID: input.SubjectGroupID,
		GradeID:   grade.ID,
		// Grade_Year:   input.Grade_Year,
		// Grade_Class:  input.Grade_Class,
		TermID: input.TermID,
		TeacherID: input.TeacherID,
	}
	
	//บันทึกข้อมูลรายวิชา
	if err := config.DB().Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกข้อมูลล้มเหลว"})
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"data": course})
	

}

//Get ดึงข้อมูลแสดงออกหน้าจอ
type ResultByCourseID struct {
	
	ID				uint 	`json:"id"`
	Course_Code		string 	`json:"course_code"` 
	Course_Name		string 	`json:"course_name"`
	SubjectGroupName string `json:"subject_group_name"`
	Credit_Num   	float32 `json:"credit_num"`
	Class_in_week 	int 	`json:"class_in_week"`
	Hours_of_term 	float32 `json:"hours_of_term"`
	Grade_Year		string 	`json:"grade_year"`
	Grade_Class 	uint	`json:"grade_class"`
	TeacherName		string 	`json:"teacher_name"`
	GradeID			uint	`json:"grade_id"`
}
//ดึงข้อมูลรายวิชาทั้งหมด
func GetCourseAll (c *gin.Context){
	courseID := c.Param("id")
	var results []ResultByCourseID
	if err := config.DB().
		Table("courses").
		Select("courses.id, courses.course_code, courses.course_name, subject_groups.subject_group_name, courses.credit_num, courses.class_in_week, courses.hours_of_term, grades.grade_year, grades.grade_class, teachers.t_first_name || ' ' || teachers.t_last_name AS teacher_name").
		Joins("LEFT JOIN subject_groups ON courses.subject_group_id = subject_groups.id").
		Joins("LEFT JOIN grades ON courses.grade_id = grades.id").
		Joins("LEFT JOIN teachers ON courses.teacher_id = teachers.id", courseID).
		Where("courses.deleted_at IS NULL"). //ช่องDeleteAt = null ให้ดึงไปแสดงที่จอ
		Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลได้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": results})
}
//ดึงข้อมูลรายวิชาตาม ID
func GetCourseByID(c *gin.Context){
	courseID := c.Param("id")
	var result ResultByCourseID
	if err := config.DB().
		Table("courses").
		Select("courses.id, courses.course_code, courses.course_name, subject_groups.subject_group_name, courses.credit_num, courses.class_in_week, courses.hours_of_term, grades.grade_year, grades.grade_class, teachers.t_first_name || ' ' || teachers.t_last_name AS teacher_name").
		Joins("LEFT JOIN subject_groups ON courses.subject_group_id = subject_groups.id").
		Joins("LEFT JOIN grades ON courses.grade_id = grades.id").
		Joins("LEFT JOIN teachers ON courses.teacher_id = teachers.id").
		Where("courses.id = ? AND courses.deleted_at IS NULL", courseID). //ช่องDeleteAt = null ให้ดึงไปแสดงที่จอ
		Scan(&result).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลได้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": result})
}

//ดึงข้อมูลระดับชั้นและห้อง ทั้งหมด
type GradeClassWithYear struct {
    ID         uint   `json:"id"`
    GradeClass int    `json:"grade_class"`
    GradeYear  string `json:"grade_year"`
}
func GetGradeClassAllWithYear(c *gin.Context) {
    var gradeClasses []GradeClassWithYear
    // ดึงข้อมูลจากตาราง grades ทั้ง grade_class และ grade_year
    if err := config.DB().Raw(`
        SELECT id, grade_class, grade_year
        FROM grades
        ORDER BY grade_year, grade_class
    `).Scan(&gradeClasses).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
    c.JSON(http.StatusOK, gradeClasses)
}
func DeleteCourseByID(c *gin.Context) {
	courseID := c.Param("id")
	var course entity.Course
	//ค้นหาข้อมูลรายวิชาตาม ID ที่รับมา
	if err := config.DB().Where("id = ?", courseID).First(&course).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลรายวิชานี้"})
		return
	}
	//ถ้าพบข้อมูลรายวิชาให้ลบข้อมูล
	if err := config.DB().Delete(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบข้อมูลไม่สำเร็จ"})
		return
	}
	// ลบสำเร็จให้ ให้ส่งค่ากลับเป็น true
	c.JSON(http.StatusOK, gin.H{"data": true})
}

//PUT แก้ไขข้อมูล /updatecourse/:id
func UpdateCourseByID(c *gin.Context){
	courseID := c.Param("id")
	var course entity.Course
	

	//ค้นหาข้อมูลรายวิชาตาม ID ที่รับมา เพื่อเช็คว่ามีข้อมูลหรือไม่
	if err := config.DB().Where("id = ?", courseID).First(&course).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลรายวิชานี้"})
		return
	}
	//รับข้อมูลที่แก้ไข
	var input CourseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var grade entity.Grade
    if err := config.DB().Where("grade_year = ? AND grade_class = ?", input.Grade_Year, input.Grade_Class).First(&grade).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบข้อมูลระดับชั้นและห้องนี้ในระบบ"})
        return
    }
	//คำนวณจำนวนชั่วโมงเรียนต่อเทอม
	houres_of_term := int(input.Credit_Num * 40.0)
	
	course.Course_Code = input.Course_Code
	course.Course_Name = input.Course_Name
	course.SubjectGroupID = input.SubjectGroupID
	course.Credit_Num = input.Credit_Num
	course.Class_in_week = input.Class_in_week
	course.Hours_of_term = houres_of_term
	course.GradeID = grade.ID
	course.TermID = input.TermID
	course.TeacherID = input.TeacherID
	//บันทึกข้อมูลที่แก้ไข
	if err := config.DB().Save(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "แก้ไขข้อมูลไม่สำเร็จ"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message":"อัปเดตรายวิชาสำเร็จ", "data": course})

}