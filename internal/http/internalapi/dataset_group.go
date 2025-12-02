package internalapi

import (
	"github.com/fivemanage/lite/api"
	"github.com/fivemanage/lite/internal/http/httputil"
	"github.com/fivemanage/lite/internal/http/validator"
	"github.com/fivemanage/lite/internal/service/dataset"
	"github.com/labstack/echo/v4"
)

func registerDatasetApi(group *echo.Group, datasetService *dataset.Service) {
	group.POST("/:organizationId/dataset", func(c echo.Context) error {
		ctx := c.Request().Context()
		orgID := c.Param("organizationId")

		var data api.Dataset
		if err := validator.BindAndValidate(c, &data); err != nil {
			return echo.NewHTTPError(500, httputil.ErrorResponse(err.Error()))
		}

		// the only reason why we copy the data is because we
		// we add the ID to the dataobject
		dataset, err := datasetService.Create(ctx, orgID, data)
		if err != nil {
			return echo.NewHTTPError(500, httputil.ErrorResponse(err.Error()))
		}

		return c.JSON(200, httputil.Response(dataset))
	})

	group.GET("/:organizationId/dataset", func(c echo.Context) error {
		ctx := c.Request().Context()
		orgID := c.Param("organizationId")

		datasets, err := datasetService.List(ctx, orgID)
		if err != nil {
			return echo.NewHTTPError(500, httputil.ErrorResponse(err.Error()))
		}

		return c.JSON(200, httputil.Response(datasets))
	})

	group.GET("/:organizationId/dataset/:datasetId/fields", func(c echo.Context) error {
		ctx := c.Request().Context()
		orgID := c.Param("organizationId")
		datasetID := c.Param("datasetId")

		fields, err := datasetService.ListFields(ctx, orgID, datasetID)
		if err != nil {
			return echo.NewHTTPError(500, httputil.ErrorResponse(err.Error()))
		}

		return c.JSON(200, httputil.Response(fields))
	})

	group.POST("/:organizationId/dataset/:datasetId/logs", func(c echo.Context) error {
		ctx := c.Request().Context()
		orgID := c.Param("organizationId")
		datasetID := c.Param("datasetId")

		var data api.ListLogsSchema
		if err := validator.BindAndValidate(c, &data); err != nil {
			return echo.NewHTTPError(500, httputil.ErrorResponse(err.Error()))
		}

		logs, err := datasetService.QueryLogs(ctx, orgID, datasetID, data.FromDate, data.ToDate, data.Filter, data.Cursor)
		if err != nil {
			return echo.NewHTTPError(500, httputil.ErrorResponse(err.Error()))
		}

		var response api.DatasetLogsResponse
		response.Data = logs
		if response.Data == nil {
			response.Data = make([]api.DatasetLog, 0)
		}

		response.Meta.TotalRowCount = len(logs)

		return c.JSON(200, httputil.Response(response))
	})
}
