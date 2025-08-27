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
		router.GET("/student", controllers.GetNameStudent)
		router.GET("/student/:id", controllers.GetNameStudentById)

		router.GET("/teacher", controllers.GetNameTeacher)
		router.GET("/teacher/:id", controllers.GetNameTeacherById)

		router.GET("/admin/:id", controllers.GetNameAdminById)

		router.GET("/grades", controllers.GetGradeYearAll)
		router.GET("/classes", controllers.GetGradeClassAll)

		router.GET("/terms", controllers.GetTermAll)

		router.GET("/enums/schedule-days", controllers.GetDaysEnums)
		router.GET("/enums/schedule-times", controllers.GetTimesEnums)

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