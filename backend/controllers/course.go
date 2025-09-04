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
	Hours_of_term 	float32 	`json:"hours_of_term"`
	// Grade_Year		string 	`json:"grade_year" binding: "required"` 
	// Grade_Class 	uint	`json:"grade_class"`
	// TermID 			uint 	`json:"term_id"`
	// TeacherID		uint 	`json:"teacher_id" binding:"required"`
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
		// GradeID: input.GradeID,
		// TermID: input.TermID,
		// TeacherID: input.TeacherID,
	}
	// var createdCourse entity.Course
	// 	if err := config.DB().
   	// 	Preload("Subject_Group").
    // 	First(&createdCourse, course.ID).Error; err != nil {
    // 	c.JSON(http.StatusInternalServerError, gin.H{"error": "โหลดข้อมูลไม่สำเร็จ"})
    // 	return
	// }
	


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
	
}
func GetCourseAll (c *gin.Context){

}