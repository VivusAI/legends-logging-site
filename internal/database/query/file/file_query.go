package filequery

import (
	"context"
	"database/sql"
	"errors"

	"github.com/fivemanage/lite/internal/database"
	"github.com/uptrace/bun"
)

// todo: rename to Insert
func Create(ctx context.Context, db *bun.DB, file *database.Asset) (bun.Tx, error) {
	var err error

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return tx, err
	}

	_, err = tx.NewInsert().Model(file).Exec(ctx)
	if err != nil {
		return tx, err
	}

	return tx, nil
}

func FindStorageFiles(ctx context.Context, db *bun.DB, organizationID, search string) ([]*database.Asset, error) {
	var files []*database.Asset

	// no, this does not scale at all, but...soonTM
	// we are also missing indexes I need to create migrations for
	sb := db.NewSelect().
		Model(&files).
		Where("organization_id = ?", organizationID).
		Order("created_at DESC")

	if search != "" {
		// not my proudest moment
		sb = sb.Where("name LIKE ?", "%"+search+"%")
	}

	err := sb.Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}

		return nil, err
	}

	return files, nil
}

func FindTotalStorageCount(ctx context.Context, db *bun.DB, organizationID string) (int, error) {
	count, err := db.NewSelect().
		Model((*database.Asset)(nil)).
		Where("organization_id = ?", organizationID).
		Count(ctx)
	if err != nil {
		return 0, err
	}

	return count, nil
}
