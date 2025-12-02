package migrate

import (
	"context"
	"fmt"
	"strings"

	"github.com/fivemanage/lite/internal/database"
	"github.com/fivemanage/lite/migrate/migrations"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/migrate"
	"github.com/uptrace/opentelemetry-go-extra/otelzap"
)

var (
	RootCmd = &cobra.Command{
		Use:   "db",
		Short: "Database migrations",
	}

	InitCmd = &cobra.Command{
		Use:   "init",
		Short: "Create migration tables",
		Run: func(cmd *cobra.Command, args []string) {
			driver := viper.GetString("driver")
			dsn := viper.GetString("dsn")
			db := database.New(driver).Connect(dsn)

			migrator := migrate.NewMigrator(db, migrations.Migrations)
			err := migrator.Init(cmd.Context())
			if err != nil {
				panic(err)
			}
		},
	}

	MigrateCmd = &cobra.Command{
		Use:   "migrate",
		Short: "Migrate database",
		Run: func(cmd *cobra.Command, args []string) {
			driver := viper.GetString("driver")
			dsn := viper.GetString("dsn")

			db := database.New(driver).Connect(dsn)

			migrator := migrate.NewMigrator(db, migrations.Migrations)
			if err := migrator.Lock(cmd.Context()); err != nil {
				panic(err)
			}
			defer migrator.Unlock(cmd.Context()) //nolint:errcheck

			group, err := migrator.Migrate(cmd.Context())
			if err != nil {
				panic(err)
			}
			if group.IsZero() {
				otelzap.S().Info("there are no new migrations to run (database is up to date)")
			}

			otelzap.S().Infof("migrated to %s", group)
		},
	}

	UnlockCmd = &cobra.Command{
		Use: "unlock",
		Run: func(cmd *cobra.Command, args []string) {
			driver := viper.GetString("driver")
			dsn := viper.GetString("dsn")
			db := database.New(driver).Connect(dsn)

			migrator := migrate.NewMigrator(db, migrations.Migrations)
			err := migrator.Unlock(cmd.Context())
			if err != nil {
				panic(err)
			}
		},
	}

	LockCmd = &cobra.Command{
		Use: "lock",
		Run: func(cmd *cobra.Command, args []string) {
			driver := viper.GetString("driver")
			dsn := viper.GetString("dsn")
			db := database.New(driver).Connect(dsn)

			migrator := migrate.NewMigrator(db, migrations.Migrations)
			err := migrator.Lock(cmd.Context())
			if err != nil {
				panic(err)
			}
		},
	}

	CreateMigrationCmd = &cobra.Command{
		Use:   "create",
		Short: "Create database migration",
		Run: func(cmd *cobra.Command, args []string) {
			driver := viper.GetString("driver")
			dsn := viper.GetString("dsn")
			db := database.New(driver).Connect(dsn)

			migrator := migrate.NewMigrator(db, migrations.Migrations)

			name := strings.Join(args, "_")
			mf, err := migrator.CreateSQLMigrations(cmd.Context(), name)
			if err != nil {
				panic(err)
			}

			for _, m := range mf {
				fmt.Printf("created migration %s (%s)\n", m.Name, m.Path)
			}
		},
	}
)

func InitMigration(ctx context.Context, db *bun.DB) {
	migrator := migrate.NewMigrator(db, migrations.Migrations)
	if err := migrator.Init(ctx); err != nil {
		panic(err)
	}
}

func AutoMigrate(ctx context.Context, db *bun.DB) {
	migrator := migrate.NewMigrator(db, migrations.Migrations)
	if err := migrator.Lock(ctx); err != nil {
		panic(err)
	}
	defer migrator.Unlock(ctx) //nolint:errcheck

	group, err := migrator.Migrate(ctx)
	if err != nil {
		panic(err)
	}
	if group.IsZero() {
		otelzap.S().Info("there are no new migrations to run (database is up to date)")
		return
	}

	logrus.Infof("migrated to %s", group)
}
