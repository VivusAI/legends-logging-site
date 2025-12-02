package migrations

import (
	"context"
	"fmt"

	"github.com/fivemanage/lite/internal/database"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		fmt.Print(" [up migration] ")
		db.RegisterModel((*database.OrganizationMember)(nil))
		_, err := db.NewCreateTable().Model((*database.OrganizationMember)(nil)).Exec(ctx)
		if err != nil {
			return err
		}
		return nil
	}, func(ctx context.Context, db *bun.DB) error {
		fmt.Print(" [down migration] ")
		return nil
	})
}
