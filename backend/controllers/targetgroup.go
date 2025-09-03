package controllers

import(
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/config"
	"github.com/lnwzaaa007/Project_SA_School-system/backend/entity"
)
type TargetGroupInput struct {
	ID		uint `json:"id"`
	Group_name	string `json:"group_name"`
}
func GetTargetGroupAll(c *gin.Context) {
	var targetGroups []TargetGroupInput
	if err := config.DB().	
		Model(&entity.Target_Group{}).
		Select("id, group_name").
		Scan(&targetGroups).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
		}
	c.JSON(http.StatusOK, targetGroups)
}