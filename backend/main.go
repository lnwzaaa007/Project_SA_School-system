package main

import (
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/controllers"
	"github.com/gin-gonic/gin"
)

const PORT = "8088"

func main() {
	config.ConnectionDB()
	config.SetupDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())

	router := r.Group("/")
	{
		// User routes
		router.GET("/student", controllers.GetNameStudent)
		router.GET("/student/:id", controllers.GetNameStudentById)

		// Teacher routes
		router.GET("/teacher", controllers.GetNameTeacher)
		router.GET("/teacher/:id", controllers.GetNameTeacherById)

		// Admin routes
		router.GET("/admin/:id", controllers.GetNameAdminById)

		// Static data routes
		router.GET("/grades", controllers.GetGradeYearAll)
		router.GET("/classes", controllers.GetGradeClassAll)

		// New routes for terms and schedule
		router.GET("/terms", controllers.GetTermAll)

		// Schedule routes
		router.GET("/schedule-days", controllers.GetDaysAll)
		router.GET("/schedule-times-start", controllers.GetTimeSrartAll)
		router.GET("/schedule-times-end", controllers.GetTimeEndAll)

		// User type route
		router.GET("users/:id", controllers.GetUserTypeByID)

	}


	// Login routes
	r.POST("/auth", controllers.LoginUser)
	// r.POST("/creator/auth", controllers.LoginUser)

	// Run the server go run main.go
	r.Run("localhost:" + PORT)

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