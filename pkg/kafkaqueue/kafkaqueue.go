package kafkaqueue

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	"github.com/fivemanage/lite/internal/clickhouse"
	"github.com/segmentio/kafka-go"
	"github.com/uptrace/opentelemetry-go-extra/otelzap"
	"go.uber.org/zap"
)

// wow, so much randomness
const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

const (
	KafkaOperationTimeout = 25 * time.Second
	// again, i wont set up partitions
	ConsumerGroupName = "default-group"
)

type TopicType string

const (
	TopicTypeBatched TopicType = "batched"
)

type Queue struct {
	kafkaP *kafka.Writer
	kafkaC *kafka.Reader
	logger *otelzap.Logger
}

// heh, fun
func GenerateRandomString(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func logf(msg string, a ...any) {
	fmt.Printf(msg, a...)
	fmt.Println()
}

func NewProducer(logger *otelzap.Logger) *Queue {
	writer := &kafka.Writer{
		Addr: kafka.TCP("localhost:9094"),
		// tbh, I'm just not feeling like setting up partitions
		// sooooo, topics and groups will have to do it
		Topic:                  "batched",
		Balancer:               &kafka.LeastBytes{},
		Async:                  true,
		ReadTimeout:            KafkaOperationTimeout,
		WriteTimeout:           KafkaOperationTimeout,
		AllowAutoTopicCreation: true,
		ErrorLogger:            kafka.LoggerFunc(logf),
	}

	return &Queue{
		kafkaP: writer,
		logger: logger,
	}
}

func NewConsumer(logger *otelzap.Logger) *Queue {
	dialer := &kafka.Dialer{
		Timeout:   KafkaOperationTimeout,
		DualStack: true,
	}

	reader := kafka.NewReader(kafka.ReaderConfig{
		Dialer:      dialer,
		Brokers:     []string{"localhost:9094"},
		Topic:       "batched",
		GroupID:     ConsumerGroupName,
		MaxBytes:    10e6,
		ErrorLogger: kafka.LoggerFunc(logf),
	})

	return &Queue{
		kafkaC: reader,
		logger: logger,
	}
}

func (q *Queue) Submit(ctx context.Context, messages []*clickhouse.Log) error {
	var kMessages []kafka.Message
	for _, v := range messages {
		key := GenerateRandomString(32)

		msgBytes, err := q.serializeMessage(v)
		if err != nil {
			// todo: Log this
			return err
		}

		kMessages = append(kMessages, kafka.Message{
			Key:   []byte(key),
			Value: msgBytes,
		})
	}

	err := q.kafkaP.WriteMessages(ctx, kMessages...)
	if err != nil {
		fmt.Println("failed to submit log", err.Error())
		return err
	}

	otelzap.L().Info("submitted log to kafka", zap.String("topic", "batched"), zap.Int("count", len(messages)))

	return nil
}

func (q *Queue) ReadMessage(ctx context.Context) *clickhouse.Log {
	m, err := q.kafkaC.ReadMessage(ctx)
	if err != nil {
		if err.Error() != "fetching message: context deadline exceeded" {
			otelzap.L().Error("failed to read message from kafka", zap.Error(err))
		}

		return nil
	}

	msg, err := q.unmarshalMessage(m.Value)
	if err != nil {
		return nil
	}

	return msg
}

func (q *Queue) unmarshalMessage(data []byte) (*clickhouse.Log, error) {
	var log clickhouse.Log
	err := json.Unmarshal(data, &log)
	if err != nil {
		return nil, err
	}

	return &log, nil
}

func (q *Queue) serializeMessage(v any) ([]byte, error) {
	b, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}

	return b, nil
}
