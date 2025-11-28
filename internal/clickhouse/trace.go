package clickhouse

import (
	"context"
	"fmt"
	"time"
)

type TraceRow struct {
	TeamId    string `ch:"TeamId"`
	DatasetId string `ch:"DatasetId"`

	Timestamp    time.Time `ch:"Timestamp"`
	TraceId      string    `ch:"TraceId"`
	SpanId       string    `ch:"SpanId"`
	ParentSpanId string    `ch:"ParentSpanId"`
	TraceState   string    `ch:"TraceState"`
	SpanName     string    `ch:"SpanName"`
	SpanKind     string    `ch:"SpanKind"`
	ServiceName  string    `ch:"ServiceName"`

	ResourceAttributes map[string]string `ch:"ResourceAttributes"`
	SpanAttributes     map[string]string `ch:"SpanAttributes"`

	Duration      uint64 `ch:"Duration"`
	StatusCode    string `ch:"StatusCode"`
	StatusMessage string `ch:"StatusMessage"`

	EventTimestamps []time.Time         `ch:"Events.Timestamp"`
	EventNames      []string            `ch:"Events.Name"`
	EventAttributes []map[string]string `ch:"Events.Attributes"`

	LinkTraceIds   []string            `ch:"Links.TraceId"`
	LinkSpanIds    []string            `ch:"Links.SpanId"`
	LinkStates     []string            `ch:"Links.TraceState"`
	LinkAttributes []map[string]string `ch:"Links.Attributes"`
}

func (c *Client) SubmitTrace(ctx context.Context, organizationID, datasetID string, traces []TraceRow) error {
	batch, err := c.conn.PrepareBatch(ctx, `
	INSERT INTO otel_traces (
		TeamId,
		DatasetId,
		Timestamp,
		TraceId,
		SpanId,
		ParentSpanId,
		TraceState,
		SpanName,
		SpanKind,
		ServiceName,
		ResourceAttributes,
		SpanAttributes,
		Duration,
		StatusCode,
		StatusMessage,
		Events.Timestamp,
		Events.Name,
		Events.Attributes,
		Links.TraceId,
		Links.SpanId,
		Links.TraceState,
		Links.Attributes
	)`)
	if err != nil {
		fmt.Println("failed to prepare batch", err.Error())
		return fmt.Errorf("failed to prepare batch: %w", err)
	}

	for _, trace := range traces {
		err := batch.Append(
			organizationID,
			datasetID,
			trace.Timestamp,
			trace.TraceId,
			trace.SpanId,
			trace.ParentSpanId,
			trace.TraceState,
			trace.SpanName,
			trace.SpanKind,
			trace.ServiceName,
			trace.ResourceAttributes,
			trace.SpanAttributes,
			trace.Duration,
			trace.StatusCode,
			trace.StatusMessage,
			trace.EventTimestamps,
			trace.EventNames,
			trace.EventAttributes,
			trace.LinkTraceIds,
			trace.LinkSpanIds,
			trace.LinkStates,
			trace.LinkAttributes,
		)
		if err != nil {
			fmt.Println("failed to append trace to batch", err.Error())
			return fmt.Errorf("failed to append trace to batch: %w", err)
		}
	}

	return batch.Send()
}
