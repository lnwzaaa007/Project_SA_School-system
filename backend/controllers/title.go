package controllers

import (
	"net/http"
  
    "github.com/gin-gonic/gin"
    "github.com/lnwzaaa007/Project_SA_School-system/backend/config"
    // "github.com/lnwzaaa007/Project_SA_School-system/backend/entity"

)

type title struct {
	Title_ID 	  uint   `json:"id" gorm:"column:id"`
	TitleTH		string `gorm:"column:title_th" json:"title_th"`
	TitleENG	string `gorm:"column:title_eng" json:"title_eng"`
}

func GetTitle(c *gin.Context) {
	var title []title
	if err := config.DB().
        Raw("SELECT MIN(id) AS id, title_th,title_eng FROM titles GROUP BY title_th ORDER BY id ASC").
        Scan(&title).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
        return
    }
	c.JSON(http.StatusOK, title)
}
func GetTitleById(c *gin.Context) {
	var name title
	id := c.Param("id")

	if err := config.DB().Table("titles").
		Select("*").
		Where("id = ?", id).
		Scan(&name).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "gender not found"})
		return
	}
	c.JSON(http.StatusOK, name)
}