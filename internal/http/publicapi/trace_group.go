package publicapi

import (
	"fmt"
	"io"

	"github.com/fivemanage/lite/internal/auth"
	"github.com/fivemanage/lite/internal/http/middleware"
	"github.com/fivemanage/lite/internal/service/token"
	"github.com/fivemanage/lite/internal/service/trace"
	"github.com/fivemanage/lite/pkg/cache"
	"github.com/labstack/echo/v4"

	coltracepb "go.opentelemetry.io/proto/otlp/collector/trace/v1"
	"google.golang.org/protobuf/encoding/protojson"
)

func registerTraceApi(
	group *echo.Group,
	traceService *trace.Service,
	tokenService *token.Service,
	cache *cache.Cache,
) {
	group.POST("/traces", func(c echo.Context) error {
		var err error

		ctx := c.Request().Context()
		dataset := c.Request().Header.Get("X-Fivemanage-Dataset")

		orgID, err := auth.CurrentOrgId(c)
		if err != nil {
			return err
		}

		bodyBytes, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		var req coltracepb.ExportTraceServiceRequest
		unmarshaler := protojson.UnmarshalOptions{
			DiscardUnknown: true,
		}

		defer c.Request().Body.Close()

		if err := unmarshaler.Unmarshal(bodyBytes, &req); err != nil {
			return err
		}

		for _, resourceSpans := range req.ResourceSpans {
			for _, span := range resourceSpans.Resource.Attributes {
				fmt.Println("span", span.Key)
			}
		}

		err = traceService.SubmitTraces(ctx, orgID, dataset, req)
		if err != nil {
			return err
		}

		return c.JSON(200, echo.Map{
			"success": true,
		})
	}, middleware.TokenAuth(tokenService, cache))
}
