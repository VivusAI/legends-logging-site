package internalapi

import (
	"fmt"

	"github.com/fivemanage/lite/internal/service/admin"
	"github.com/labstack/echo/v4"
)

func registerAdminApi(group *echo.Group, adminService *admin.Service) {
	group.POST("/:organizationId/admin/member", func(c echo.Context) error {
		ctx := c.Request().Context()
		orgID := c.Param("organizationId")

		fmt.Println("orgID", orgID)
		fmt.Println("ctx", ctx)

		return nil
	})
}
