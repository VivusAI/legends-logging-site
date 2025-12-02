package publicapi

import (
	"net/http"

	"github.com/fivemanage/lite/internal/auth"
	"github.com/fivemanage/lite/internal/http/httputil"
	"github.com/fivemanage/lite/internal/http/middleware"
	"github.com/fivemanage/lite/internal/service/file"
	"github.com/fivemanage/lite/internal/service/token"
	"github.com/fivemanage/lite/pkg/cache"
	"github.com/labstack/echo/v4"
)

// DRY they said
func registerMediaApi(group *echo.Group, fileService *file.Service, tokenService *token.Service, cache *cache.Cache) {
	group.POST("/image", func(c echo.Context) error {
		return handler(c, "image", fileService)
	}, middleware.TokenAuth(tokenService, cache), middleware.ValidateMime("image", middleware.WhitelistedImageMIME))

	group.POST("/video", func(c echo.Context) error {
		return handler(c, "video", fileService)
	}, middleware.TokenAuth(tokenService, cache), middleware.ValidateMime("video", middleware.WhitelistedVideoMIME))

	group.POST("/audio", func(c echo.Context) error {
		return handler(c, "audio", fileService)
	}, middleware.TokenAuth(tokenService, cache), middleware.ValidateMime("audio", middleware.WhitelistedAudioMIME))

	group.POST("/file", func(c echo.Context) error {
		return handler(c, "file", fileService)
	}, middleware.TokenAuth(tokenService, cache), middleware.ValidateMime("file", nil))
}

func handler(c echo.Context, fileType string, fileService *file.Service) error {
	var err error
	ctx := c.Request().Context()

	orgId, err := auth.CurrentOrgId(c)
	if err != nil {
		// we should probably have a better error here
		return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized: "+err.Error())
	}

	file, header, err := httputil.File(c.Request(), fileType)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": err.Error(),
		})
	}

	err = fileService.CreateFile(ctx, orgId, file, header)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(200, nil)
}
