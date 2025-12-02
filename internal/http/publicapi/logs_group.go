package publicapi

import (
	"github.com/fivemanage/lite/api"
	"github.com/fivemanage/lite/internal/auth"
	"github.com/fivemanage/lite/internal/http/middleware"
	"github.com/fivemanage/lite/internal/service/log"
	"github.com/fivemanage/lite/internal/service/token"
	"github.com/fivemanage/lite/pkg/cache"
	"github.com/labstack/echo/v4"
)

func registerLogsApi(
	group *echo.Group,
	logService *log.Service,
	tokenService *token.Service,
	cache *cache.Cache,
) {
	group.POST("/logs", func(c echo.Context) error {
		ctx := c.Request().Context()
		dataset := c.Request().Header.Get("X-Fivemanage-Dataset")

		orgID, err := auth.CurrentOrgId(c)
		if err != nil {
			return err
		}

		var logs []api.Log
		if err := c.Bind(&logs); err != nil {
			return err
		}

		logService.SubmitLogs(ctx, orgID, dataset, logs)

		return c.JSON(200, echo.Map{
			"success": true,
		})
	}, middleware.TokenAuth(tokenService, cache))
}
