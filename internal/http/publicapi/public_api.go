package publicapi

import (
	"github.com/fivemanage/lite/internal/service/file"
	"github.com/fivemanage/lite/internal/service/log"
	"github.com/fivemanage/lite/internal/service/token"
	"github.com/fivemanage/lite/pkg/cache"
	"github.com/labstack/echo/v4"
)

func Add(group *echo.Group,
	fileService *file.Service,
	tokenService *token.Service,
	logService *log.Service,
	cache *cache.Cache,
) {
	registerMediaApi(group, fileService, tokenService, cache)
	registerLogsApi(group, logService, tokenService, cache)
}
