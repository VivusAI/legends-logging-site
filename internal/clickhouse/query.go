package clickhouse

import (
	"context"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/fivemanage/lite/api"
	"github.com/fivemanage/lite/pkg/querybuilder"
)

func (c *Client) QueryLogs(ctx context.Context, organizationID, datasetID string, startTime, endTime time.Time, filter api.DatasetFilter, cursor int) ([]api.DatasetLog, error) {
	qb := querybuilder.New().Filter(filter).WithDateRange(startTime, endTime)
	query, args := qb.Build(organizationID, datasetID)

	fmt.Println(query)

	rows, err := c.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}

	defer func() {
		if err := rows.Close(); err != nil {
			fmt.Println(err)
		}
	}()

	var logs []api.DatasetLog
	for rows.Next() {
		var (
			Timestamp     time.Time
			DatasetId     string
			TraceId       string
			TeamId        string
			Body          string
			Attributes    map[string]string
			RetentionDays uint32
		)
		if err := rows.Scan(&Timestamp, &DatasetId, &TraceId, &TeamId, &Body, &Attributes, &RetentionDays); err != nil {
			return nil, err
		}
		logs = append(logs, api.DatasetLog{
			Timestamp:  Timestamp,
			DatasetId:  DatasetId,
			TraceId:    TraceId,
			TeamId:     TeamId,
			Body:       Body,
			Attributes: Attributes,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return logs, nil
}

func (r *Client) QueryLogFields(ctx context.Context, organizationID, datasetID string) ([]LogField, error) {
	chCtx := clickhouse.Context(ctx, clickhouse.WithParameters(clickhouse.Parameters{
		"TeamId":    organizationID,
		"DatasetId": datasetID,
	}))

	query, err := r.conn.Query(chCtx, "SELECT DISTINCT Key, Type FROM log_keys WHERE TeamId = {TeamId:String} AND DatasetId = {DatasetId:String}")
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	defer func() {
		if err := query.Close(); err != nil {
			fmt.Println(err)
		}
	}()

	var fields []LogField

	for query.Next() {
		var (
			field     string
			fieldType string
		)

		err := query.Scan(&field, &fieldType)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}

		fields = append(fields, LogField{Field: field, Type: fieldType})
	}

	if err := query.Err(); err != nil {
		return nil, err
	}

	return fields, nil
}

func (r *Client) QueryTotalLogs(ctx context.Context, organizationID, datasetID string) (int, error) {
	return 0, nil
}
