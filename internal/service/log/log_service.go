package log

import (
	"context"
	"maps"
	"time"

	"github.com/fivemanage/lite/api"
	"github.com/fivemanage/lite/internal/clickhouse"
	"github.com/fivemanage/lite/internal/crypt"
	"github.com/fivemanage/lite/internal/service/dataset"
	"github.com/fivemanage/lite/pkg/kafkaqueue"
	"github.com/uptrace/bun"
	"github.com/uptrace/opentelemetry-go-extra/otelzap"
	"go.uber.org/zap"
)

type Service struct {
	db             *bun.DB
	kafkaProducer  *kafkaqueue.Queue
	datasetService *dataset.Service
}

func NewService(db *bun.DB, kafkaProducer *kafkaqueue.Queue, clickhouseClient *clickhouse.Client, datasetService *dataset.Service) *Service {
	return &Service{
		db:             db,
		kafkaProducer:  kafkaProducer,
		datasetService: datasetService,
	}
}

func (r *Service) SubmitLogs(ctx context.Context, organizationId string, datasetName string, logs []api.Log) {
	clickhouseLogs := make([]*clickhouse.Log, len(logs))

	for i, log := range logs {
		traceID, err := crypt.GeneratePrimaryKey()
		if err != nil {
			otelzap.L().Error("failed to generate trace id", zap.Error(err))
			break
		}

		dataset, err := r.datasetService.FindByName(ctx, organizationId, datasetName)
		if err != nil {
			otelzap.L().Error("failed to find dataset", zap.Error(err))
			break
		}

		timestamp := time.Now().UTC()
		metadata := make(map[string]string)

		for k, v := range log.Metadata {
			maps.Copy(metadata, buildLogAttributes(k, v, 0))
		}

		// fix log message because it can be silly sometimes
		logMessage := formatMessage(log.Message)

		// these should override any metadata that matches
		metadata["message"] = logMessage
		metadata["severity"] = log.Level
		metadata["_resource"] = log.Resource

		clickhouseLogs[i] = &clickhouse.Log{
			TraceID:       traceID,
			Timestamp:     timestamp,
			TeamID:        organizationId,
			DatasetID:     dataset.ID,
			Body:          logMessage,
			Attributes:    metadata,
			RetentionDays: 30,
		}
	}

	err := r.kafkaProducer.Submit(ctx, clickhouseLogs)
	if err != nil {
		otelzap.L().Error("failed to submit logs to kafka", zap.Error(err))
	}
}
