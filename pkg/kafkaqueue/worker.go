package kafkaqueue

import (
	"context"
	"fmt"
	"time"

	"github.com/fivemanage/lite/internal/clickhouse"
	"github.com/uptrace/opentelemetry-go-extra/otelzap"
	"go.uber.org/zap"
)

const (
	DefaultBatchFlushSize      = 10000
	DefaultBatchedFlushTimeout = 3 * time.Second
)

type KafkaBatchWorker struct {
	consumer         *Queue
	logs             []*clickhouse.Log
	lastFlush        time.Time
	clickhouseClient *clickhouse.Client
}

func NewBatchWorker(clickhouseClient *clickhouse.Client, kafkaConsumer *Queue) *KafkaBatchWorker {
	return &KafkaBatchWorker{
		consumer:         kafkaConsumer,
		logs:             []*clickhouse.Log{},
		lastFlush:        time.Now(),
		clickhouseClient: clickhouseClient,
	}
}

func (r *KafkaBatchWorker) ProcessMessages() {
	for {
		func(ctx context.Context) {
			readCtx, readCancel := context.WithTimeout(ctx, DefaultBatchedFlushTimeout)
			defer readCancel()

			msg := r.consumer.ReadMessage(readCtx)
			if msg != nil {
				r.logs = append(r.logs, msg)
			}

			if time.Since(r.lastFlush) > DefaultBatchedFlushTimeout || len(r.logs) > DefaultBatchFlushSize {
				err := r.clickhouseClient.BatchWriteLogRows(ctx, r.logs)
				if err != nil {
					fmt.Println("failed to batch write logs", err.Error())
				}

				if len(r.logs) > 0 {
					otelzap.L().Info("flushed logs to clickhouse", zap.Int("count", len(r.logs)))
				}

				r.lastFlush = time.Now()
				r.logs = []*clickhouse.Log{}
			}
		}(context.Background())
	}
}
