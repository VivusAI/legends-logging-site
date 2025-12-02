package internalapi

import (
	"github.com/fivemanage/lite/api"
	"github.com/fivemanage/lite/internal/auth"
	"github.com/fivemanage/lite/internal/http/httputil"
	"github.com/fivemanage/lite/internal/service/organization"
	"github.com/labstack/echo/v4"
)

func registerOrganizationApi(group *echo.Group, organizationService *organization.Service) {
	group.POST("/organization", func(c echo.Context) error {
		var data api.CreateOrganizationRequest
		if err := c.Bind(&data); err != nil {
			return echo.NewHTTPError(400, err)
		}

		currentUser, err := auth.CurrentUser(c)
		if err != nil {
			return echo.NewHTTPError(401, err)
		}

		organization, err := organizationService.CreateOrganization(c.Request().Context(), &data, currentUser.ID)
		if err != nil {
			return echo.NewHTTPError(500, err)
		}

		return c.JSON(200, organization)
	})

	group.GET("/organization", func(c echo.Context) error {
		organizations, err := organizationService.ListOrganizations(c.Request().Context())
		if err != nil {
			return echo.NewHTTPError(500, err)
		}

		return c.JSON(200, httputil.Response(organizations))
	})

	group.GET("/organization/:id", func(c echo.Context) error {
		id := c.Param("id")
		organization, err := organizationService.FindOrganizationByID(c.Request().Context(), id)
		if err != nil {
			return echo.NewHTTPError(500, err)
		}

		return c.JSON(200, httputil.Response(organization))
	})
}
