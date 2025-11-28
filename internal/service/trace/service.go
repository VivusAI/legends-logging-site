package trace

import (
	"context"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/fivemanage/lite/internal/clickhouse"
	"github.com/fivemanage/lite/internal/service/dataset"

	coltracepb "go.opentelemetry.io/proto/otlp/collector/trace/v1"
	commonpb "go.opentelemetry.io/proto/otlp/common/v1"
	tracepb "go.opentelemetry.io/proto/otlp/trace/v1"
)

type Service struct {
	clickhouseClient *clickhouse.Client
	datasetService   *dataset.Service
}

func NewService(clickhouseClient *clickhouse.Client, datasetService *dataset.Service) *Service {
	return &Service{
		clickhouseClient: clickhouseClient,
		datasetService:   datasetService,
	}
}

func (r *Service) SubmitTraces(ctx context.Context, organizationID, datasetID string, traces coltracepb.ExportTraceServiceRequest) error {
	var err error

	dataset, err := r.datasetService.FindByName(ctx, organizationID, datasetID)
	if err != nil {
		return err
	}

	rows := ProcessBatch(&traces)

	err = r.clickhouseClient.SubmitTrace(ctx, organizationID, dataset.ID, rows)
	if err != nil {
		fmt.Println("failed to submit trace", err.Error())
		return err
	}

	return nil
}

func attributesToMap(attrs []*commonpb.KeyValue) map[string]string {
	result := make(map[string]string, len(attrs))
	for _, kv := range attrs {
		result[kv.Key] = anyValueToString(kv.Value)
	}
	return result
}

func anyValueToString(v *commonpb.AnyValue) string {
	if v == nil {
		return ""
	}
	switch v.Value.(type) {
	case *commonpb.AnyValue_StringValue:
		return v.GetStringValue()
	case *commonpb.AnyValue_BoolValue:
		return fmt.Sprintf("%t", v.GetBoolValue())
	case *commonpb.AnyValue_IntValue:
		return fmt.Sprintf("%d", v.GetIntValue())
	case *commonpb.AnyValue_DoubleValue:
		return fmt.Sprintf("%f", v.GetDoubleValue())
	case *commonpb.AnyValue_ArrayValue:
		// Recursively convert arrays to specific string format
		var items []string
		for _, item := range v.GetArrayValue().Values {
			items = append(items, anyValueToString(item))
		}
		return fmt.Sprintf("[%s]", strings.Join(items, ","))
	default:
		return v.String()
	}
}

func mapStatusCode(code tracepb.Status_StatusCode) string {
	switch code {
	case tracepb.Status_STATUS_CODE_UNSET:
		return "UNSET"
	case tracepb.Status_STATUS_CODE_OK:
		return "OK"
	case tracepb.Status_STATUS_CODE_ERROR:
		return "ERROR"
	default:
		return "UNSET"
	}
}

func processLinks(links []*tracepb.Span_Link) ([]string, []string, []string, []map[string]string) {
	traceIDs := make([]string, 0, len(links))
	spanIDs := make([]string, 0, len(links))
	states := make([]string, 0, len(links))
	attrs := make([]map[string]string, 0, len(links))

	for _, link := range links {
		traceIDs = append(traceIDs, hex.EncodeToString(link.TraceId))
		spanIDs = append(spanIDs, hex.EncodeToString(link.SpanId))

		states = append(states, link.TraceState)

		attrs = append(attrs, attributesToMap(link.Attributes))
	}

	return traceIDs, spanIDs, states, attrs
}

func ProcessBatch(req *coltracepb.ExportTraceServiceRequest) []clickhouse.TraceRow {
	var rows []clickhouse.TraceRow

	for _, rSpan := range req.ResourceSpans {

		resAttrs := attributesToMap(rSpan.Resource.Attributes)

		teamID := resAttrs["team.id"]
		datasetID := resAttrs["dataset.id"]
		serviceName := resAttrs["service.name"] // OTel standard key

		for _, sSpan := range rSpan.ScopeSpans {
			for _, span := range sSpan.Spans {
				startTime := time.Unix(0, int64(span.StartTimeUnixNano))

				traceID := hex.EncodeToString(span.TraceId)
				spanID := hex.EncodeToString(span.SpanId)
				parentSpanID := hex.EncodeToString(span.ParentSpanId)

				statusCode := mapStatusCode(span.Status.Code)

				evtTimes, evtNames, evtAttrs := processEvents(span.Events)

				lnkTraceIds, lnkSpanIds, lnkStates, lnkAttrs := processLinks(span.Links)

				row := clickhouse.TraceRow{
					TeamId:             teamID,
					DatasetId:          datasetID,
					Timestamp:          startTime,
					TraceId:            traceID,
					SpanId:             spanID,
					ParentSpanId:       parentSpanID,
					TraceState:         span.TraceState,
					SpanName:           span.Name,
					SpanKind:           span.Kind.String(), // e.g. "SPAN_KIND_SERVER"
					ServiceName:        serviceName,
					ResourceAttributes: resAttrs,
					SpanAttributes:     attributesToMap(span.Attributes),
					Duration:           span.EndTimeUnixNano - span.StartTimeUnixNano,
					StatusCode:         statusCode,
					StatusMessage:      span.Status.Message,

					EventTimestamps: evtTimes,
					EventNames:      evtNames,
					EventAttributes: evtAttrs,
					LinkTraceIds:    lnkTraceIds,
					LinkSpanIds:     lnkSpanIds,
					LinkStates:      lnkStates,
					LinkAttributes:  lnkAttrs,
				}

				rows = append(rows, row)
			}
		}
	}
	return rows
}

func processEvents(events []*tracepb.Span_Event) ([]time.Time, []string, []map[string]string) {
	var times []time.Time
	var names []string
	var attrs []map[string]string

	for _, e := range events {
		times = append(times, time.Unix(0, int64(e.TimeUnixNano)))
		names = append(names, e.Name)
		attrs = append(attrs, attributesToMap(e.Attributes))
	}
	return times, names, attrs
}
