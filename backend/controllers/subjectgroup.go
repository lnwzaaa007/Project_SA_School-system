package controllers

import(
	"net/http"
	"github.com/gin-gonic/gin"	
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)
type SubjectGroupInput struct {
	ID		uint `json:"id"`
	SubjectGroup_Name	string `json:"subject_group_name"`
}
func GetSubjectGroupAll(c *gin.Context) {
	var subjectGroups []SubjectGroupInput
	if err := config.DB().	
		Model(&entity.Subject_Group{}).
		Select("id, subject_group_name").	
		Scan(&subjectGroups).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
		}
	c.JSON(http.StatusOK, subjectGroups)
}