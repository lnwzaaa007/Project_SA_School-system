package main

import (
	"net/http"
	"os"
	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/controllers"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/middlewares"
)

const PORT = "8088"

func main() {
	config.ConnectionDB()
	config.SetupDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())
	// r.Use(middlewares.Authorizes())
	r.POST("/submit-assignment", controllers.AssignmentSubmit)
	r.POST("/upload", controllers.UploadFileOnly)
	r.MaxMultipartMemory = 64 << 20
	// ✅ วางสองบรรทัดนี้ตรงนี้ (นอก group / ไม่ต้องมี auth)
	  _ = os.MkdirAll("uploads", 0755)        
	_ = os.MkdirAll("uploads/qr", 0755)
	r.StaticFS("/uploads", http.Dir("uploads"))     // เสิร์ฟไฟล์ใน /uploads เป็นสาธารณะ
	r.GET("/dev/seed/tuition", controllers.SeedTuition)


	router := r.Group("/")
	router.Use(middlewares.Authorizes())
	
	
	{
		// student
		router.GET("/students/:user_id", controllers.GetStudentAllById) //ดึงข้อมูลนักเรียน

		// router.GET("/student/:id", controllers.GetNameStudentById)
		
		
		// Teacher routes
		// router.GET("/teacher", controllers.GetNameTeacher)
		// router.GET("/teachers/:user_id",controllers.GetTeacherAllById)

		// router.GET("/teacher/:id", controllers.GetNameTeacherById)
		


		router.POST("/studentAdd", controllers.AddStudent)                // สร้างนักเรียน (JSON + base64/dataURL สำหรับรูป)
		router.PUT("/student/:id", controllers.UpdateStudent)          // แก้ไขนักเรียนตาม PK id
		// List + ค้นหา + แบ่งหน้า + กรอง
		router.GET("/student", controllers.ListStudents)	// อ่านทีละคน (เลี่ยงชนกับ /students/:user_id เดิม)
		router.GET("/student/:id", controllers.GetStudentByID)		// รูป (มีแล้ว / หรือใส่ตามนี้ให้ชัวร์)
		router.GET("/student/:id/image", controllers.GetStudentImage)		
		router.DELETE("/students/:id", controllers.DeleteStudent)       // (ถ้ามีฟังก์ชัน) ลบนักเรียนตาม PK id

		//Guardian routes ผู้ปกครอง
		router.POST("/guardian-student", controllers.CreateGuardianProfile)
		router.GET("/guardian-student", controllers.ListGuardiansByStudent)    // ?student_id=123
		router.GET("/guardian-student/:id", controllers.GetGuardianLinkByID)
		router.PUT("/guardian-student/:id", controllers.UpdateGuardianLink)
		router.DELETE("/guardian-student/:id", controllers.DeleteGuardianLink)

		// Address routes (CRUD)
		router.POST("/addressesN", controllers.CreateAddressN)
		router.GET("/addressesN", controllers.ListAddressesN)
		// router.GET("/addresses/:id", controllers.GetAddressByIDn)
		router.PUT("/addressesN/:id", controllers.UpdateAddressN)
		router.DELETE("/addressesN/:id", controllers.DeleteAddressN)
		router.GET("/addressesN/:id", controllers.GetAddressN)

		// Teacher routes
		router.GET("/teacher", controllers.GetNameTeacher)
		router.GET("/teachers/:user_id", controllers.GetTeacherAllById)
		router.GET("/teacher/:id", controllers.GetNameTeacherById)
		router.GET("/teachers", controllers.GetNameTeacherAll) //ดึงชื่อครูทั้งหมด
		router.POST("/teacher", controllers.CreateTeacher)
		router.GET("/teacher-detail",controllers.GetTeacherDetail)
		router.GET("/teacher-detail/:id",controllers.GetTeacherDetailById)
		router.DELETE("/teacher/:id", controllers.DeleteTeacher)

		// Admin routes
		router.GET("/admin/:id", controllers.GetNameAdminById)
		
		// Grade routes
		router.GET("/gradeyears", controllers.GetGradeYearAll)
		router.GET("/gradeclasses", controllers.GetGradeClassAll)
		router.GET("/gradeclassID", controllers.GetGradesByYearAndClass)

		router.GET("/grades", controllers.ListGrades)

		// New routes for terms and schedule
		router.GET("/terms", controllers.GetTermAll)
		
		// Schedule routes
		router.GET("/schedule-days", controllers.GetDaysAll)
		router.GET("/schedule-times-start", controllers.GetTimeSrartAll)
		router.GET("/schedule-times-end", controllers.GetTimeEndAll)
		router.GET("/schedule-get-id", controllers.GetSchedulesByID) //schedule-get-all?grade=2&term=1
		router.GET("/schedule-course/:id", controllers.GetCourse)
		router.POST("/schedules", controllers.CreateSchedule)
		router.DELETE("/schedules/:id", controllers.DeleteScheduleByID)
		router.GET("/students/schedule", controllers.GetStudentSchedule)
		router.GET("/teachers/schedule", controllers.GetTeacherschedule)

		//Attendances routes
		router.GET("/attendances-course", controllers.GetCourseInSchedule)
		router.GET("/attendances-student", controllers.GetStudentAllByGradeId)
		router.POST("/attendances-record", controllers.CreateAttendance)
		router.PUT("/attendances-record", controllers.UpdateAttendanceByDate)
		router.GET("/attendances/student-history", controllers.GetAttendanceStudent)
		router.GET("/attendances/teacher-history", controllers.GetAttendanceTeacher)
		router.GET("/attendances-date", controllers.GetAttendanceByDate)

		// User type route
		router.GET("/users/:id", controllers.GetUserTypeByID)

		// Province routes
		router.GET("/province", controllers.GetProvince)
		router.GET("/province/:id", controllers.GetProvinceById)
		
		// // Thai_Province routes
		// router.GET("/thaiprovince", controllers.GetThaiProvince)
		// router.GET("/thaiprovince/:id", controllers.GetThaiProvinceById)

		// District routes
		router.GET("/district", controllers.GetDistrict)
		router.GET("/district/:id", controllers.GetDistrictById)

		// Address routes
		router.POST("/address", controllers.CreateAddress) //toto
		// Thai_Province routes
		router.GET("/thaiprovince", controllers.GetThaiProvince)
		router.GET("/thaiprovince/:id", controllers.GetThaiProvinceById)

		// Thai_District routes
		router.GET("/thaidistrict", controllers.GetThaiDistrict)
		router.GET("/thaidistrict/:id", controllers.GetThaiDistrictById)

		// Thai_Subdistrict routes
		router.GET("/thaisubdistrict", controllers.GetThaiSubdistrict)
		router.GET("/thaisubdistrict/:id", controllers.GetThaiSubdistrictById)
		router.GET("/thaizipcode/:id", controllers.GetThaiZipcodeById)

		//Announcement routes
		router.POST("/new-announcement", controllers.CreateAnnouncement)
		// router.GET("/announcements", controllers.ListAnnouncements)
		// router.GET("/announcements/:id", controllers.GetAnnouncementByID)
		
		//Target Group routes
		router.GET("/targetgroup", controllers.GetTargetGroupAll)

		// Course routes
		router.GET("/subjectgroup", controllers.GetSubjectGroupAll)
		router.POST("/new-course", controllers.CreateCourse)
		// router.GET("/courses", controllers.ListCourses)
		// router.GET("/courses/:id", controllers.GetCourseByID)
		// router.PUT("/course/:id", controllers.UpdateCourseByID)
		router.DELETE("/course/:id", controllers.DeleteCourseByID)
		router.GET("/gradeclass/allwithyear", controllers.GetGradeClassAllWithYear)	
		router.GET("/coursesall", controllers.GetCourseAll) //ดึงข้อมูลวิชาทั้งหมด
		router.PUT("/course/:id", controllers.UpdateCourseByID)
		router.GET("/course/:id", controllers.GetCourseByID) //ดึงข้อมูลรายวิชาตาม ID

		// CreateAssignments routes
		router.POST("/assignments", controllers.CreateHomeWork)
		router.GET("/assignments/:id", controllers.GetAllAssignment)
		router.GET("/assignment/:id", controllers.GetAllAssignment)
		
		
		
		// // Course routes
		// router.GET("/courses", controllers.GetCourses)

		//Payment routes
		router.POST("/bills/create", controllers.CreateBillByStudentTerm)
		
		router.GET("/bills/student/:id", controllers.ListStudentBills) // alias
		router.GET("/bills/summary", controllers.BillsSummary)
		// Admin can list payment slips (waiting/complete)
		router.GET("/payments", controllers.ListPaymentSlipsForAdmin)
        // Student can view their payment results
        router.GET("/payments/student/:id", controllers.ListStudentPayments)
		router.POST("/payments/upload", controllers.UploadPaymentSlip)
		router.POST("/payments/:id/verify", controllers.VerifyPayment)
		router.GET("/payments/options/:student_id", controllers.GetStudentTuitionOptions)
				
	

		// ส่งงาน
		// router.POST("/submit-assignment", controllers.AssignmentSubmit)
		
		// Teacher: Education Records (คะแนนนักเรียน)
		router.POST("/teacher/education-records", controllers.CreateEducationRecord)
		router.PUT("/teacher/education-records/:id", controllers.UpdateEducationRecord)
		router.DELETE("/teacher/education-records/:id", controllers.DeleteEducationRecord)
		router.GET("/teacher/education-records/:id", controllers.GetEducationRecordByID)
		router.GET("/teacher/education-records", controllers.ListEducationRecords)

		// Student self-view: นักเรียนดูคะแนนตัวเอง
		router.GET("/student/education-records", controllers.ListMyEducationRecords)
		router.GET("/student/education-records/:id", controllers.GetMyEducationRecordByID)
		router.GET("/student/education-record", controllers.GetMyEducationRecordByTermCourse)

		// Course routes
		router.GET("/courses", controllers.GetCourses)


		// ✅ ดาวน์โหลดตาม id
		// router.GET("/submissions/:id/download", controllers.DownloadSubmission)
		// // สมัครเรียน
		//  router.POST("/enrollments", controllers.CreateEnrollment)

		// gender
		router.GET("/gender", controllers.GetGender)
		router.GET("/gender/:id", controllers.GetGenderById)

		// title
		router.GET("/title", controllers.GetTitle)
		router.GET("/title/:id", controllers.GetTitleById)

		// enrollment
		router.GET("/enrollment", controllers.GetEnrollment)
		router.GET("/enrollment/:id", controllers.GetEnrollmentById)
		router.DELETE("/enrollment/:id", controllers.DeleteEnrollment)

	}

	// ให้เสิร์ฟไฟล์ในโฟลเดอร์ ./uploads เป็น static
	// r.Static("/uploads", "./uploads")
	r.POST("/enrollments", controllers.CreateEnrollment)

	// Login routes
	r.POST("/auth", controllers.LoginUser)
	// r.POST("/creator/auth", controllers.LoginUser)

	// Run the server go run main.go
	r.Run("localhost:" + PORT)
	// สมัครเรียน

}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
