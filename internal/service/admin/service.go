package admin

import (
	"context"

	"github.com/uptrace/bun"
	"go.opentelemetry.io/otel"
)

var tracer = otel.Tracer("github.com/fivemanage/lite/internal/service/admin")

type Service struct {
	db *bun.DB
}

func NewService(db *bun.DB) *Service {
	return &Service{
		db: db,
	}
}

func (r *Service) CreateMember(ctx context.Context) {
}

func (r *Service) UpdateMember(ctx context.Context) {
}

func (r *Service) DeleteMember(ctx context.Context) {
}

func (r *Service) ResetMemberPassword(ctx context.Context) {
}
