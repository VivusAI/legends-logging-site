package publicapi

import "github.com/labstack/echo/v4"

func registerTraceApi(group *echo.Group) {
	group.GET("/traces", func(c echo.Context) error {
		return c.JSON(200, echo.Map{
			"success": true,
		})
	})
}
