package middleware

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/fivemanage/lite/internal/service/auth"
	"github.com/labstack/echo/v4"
)

func Session(authService *auth.Auth) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := c.Request().Context()
			orgID := c.Param("organizationId")

			if strings.HasPrefix(c.Request().URL.Path, "/api/dash/auth") {
				return next(c)
			}

			sessionCookie, err := c.Cookie("fmlite_session")
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "session required"})
			}

			user, err := authService.UserBySession(ctx, sessionCookie.Value)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid session"})
			}

			if len(orgID) > 0 {
				isMember, err := authService.IsOrganizationMember(ctx, int64(user.ID), orgID)
				if err != nil {
					slog.Error("failed to check organization membership", "error", err, "userID", user.ID, "orgID", orgID)
					// we need a better error here
					return c.JSON(http.StatusInternalServerError, map[string]string{"error": "authorization check failed"})
				}

				if !isMember {
					// and here
					return c.JSON(http.StatusForbidden, map[string]string{"error": "access denied to organization"})
				}
			}

			c.Set("user", user)
			c.Set("org_id", orgID)
			return next(c)
		}
	}
}
