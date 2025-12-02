package clickhouse

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

type Config struct {
	Host     string
	Username string
	Password string
	Database string
}

type Client struct {
	conn driver.Conn
}

type Log struct {
	TraceID       string
	Timestamp     time.Time
	TeamID        string
	DatasetID     string
	Body          string
	Attributes    map[string]string
	RetentionDays int
}

type LogField struct {
	Field string
	Type  string
}

func NewClient(config *Config) *Client {
	c := &Client{}

	options := getClickhouseOptions(config)
	conn, err := connect(options)
	if err != nil {
		fmt.Printf("Error connecting to ClickHouse: %v\n", err)
	}

	c.conn = conn
	return c
}

func getClickhouseOptions(config *Config) *clickhouse.Options {
	return &clickhouse.Options{
		Addr: []string{config.Host},
		Auth: clickhouse.Auth{
			Database: config.Database,
			Username: config.Username,
			Password: config.Password,
		},
		// MaxOpenConns: 1000,
		ClientInfo: clickhouse.ClientInfo{
			Products: []struct {
				Name    string
				Version string
			}{
				{Name: "lite-server", Version: "0.1"},
			},
		},
		Debugf: func(format string, v ...any) {
			fmt.Printf(format, v)
		},
	}
}

func connect(options *clickhouse.Options) (driver.Conn, error) {
	ctx := context.Background()
	conn, err := clickhouse.Open(options)
	if err != nil {
		return nil, err
	}

	if err := conn.Ping(ctx); err != nil {
		var exception *clickhouse.Exception
		if errors.As(err, &exception) {
			fmt.Printf("Exception [%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)
		}
		return nil, err
	}

	return conn, nil
}

func (c *Client) BatchWriteLogRows(ctx context.Context, logs []*Log) error {
	if len(logs) == 0 {
		return nil
	}

	batch, err := c.conn.PrepareBatch(ctx, "INSERT INTO logs (Timestamp, DatasetId, TraceId, TeamId, Body, Attributes, RetentionDays)")
	if err != nil {
		return fmt.Errorf("failed to prepare batch: %w", err)
	}

	for _, log := range logs {
		err := batch.Append(
			log.Timestamp,
			log.DatasetID,
			log.TraceID,
			log.TeamID,
			log.Body,
			log.Attributes,
			log.RetentionDays,
		)
		if err != nil {
			return fmt.Errorf("failed to append log to batch: %w", err)
		}
	}

	return batch.Send()
}
