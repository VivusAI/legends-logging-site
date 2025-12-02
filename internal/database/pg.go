package database

import (
	"database/sql"
	"log/slog"
	"time"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

type PostgreSQL struct{}

func (r *PostgreSQL) Connect(dsn string) *bun.DB {
	var sqldb *sql.DB
	var err error

	maxRetries := 3
	retryWaitTime := 5 * time.Second

	for i := range maxRetries {
		sqldb = sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))

		err = sqldb.Ping()
		if err == nil {
			slog.Info("successfully connected to the PostgreSQL database")
			break
		}

		slog.Warn("could not connect to the database. Retrying in 5s...", slog.Any("error", err))

		time.Sleep(retryWaitTime)

		if i == maxRetries-1 {
			slog.Error("failed to connect to the database after multiple attempts", slog.Any("error", err))
		}

	}

	return bun.NewDB(sqldb, pgdialect.New())
}
