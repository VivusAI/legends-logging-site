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
		db.RegisterModel((*database.Asset)(nil))
		_, err := db.NewCreateTable().Model((*database.Asset)(nil)).Exec(ctx)
		if err != nil {
			return err
		}

		return nil
	}, func(ctx context.Context, db *bun.DB) error {
		fmt.Print(" [down migration] ")

		_, err := db.NewDropTable().Model((*database.Asset)(nil)).IfExists().Exec(ctx)
		if err != nil {
			return err
		}

		return nil
	})
}
