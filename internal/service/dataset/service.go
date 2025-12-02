package dataset

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/fivemanage/lite/api"
	"github.com/fivemanage/lite/internal/clickhouse"
	"github.com/fivemanage/lite/internal/crypt"
	"github.com/fivemanage/lite/internal/database"
	datasetquery "github.com/fivemanage/lite/internal/database/query/dataset"
	"github.com/uptrace/bun"
)

type Service struct {
	db *bun.DB
	ch *clickhouse.Client
}

func NewService(db *bun.DB, clickhouseClient *clickhouse.Client) *Service {
	return &Service{
		db: db,
		ch: clickhouseClient,
	}
}

func (r *Service) Create(ctx context.Context, orgID string, data api.Dataset) (*api.Dataset, error) {
	var err error

	datasetID, err := crypt.GeneratePrimaryKey()
	if err != nil {
		return nil, err
	}

	dbDataset := &database.Dataset{
		ID:             datasetID,
		Name:           data.Name,
		Description:    data.Description,
		RetentionDays:  data.RetentionDays,
		OrganizationID: orgID,
	}

	err = datasetquery.Insert(ctx, r.db, dbDataset)
	if err != nil {
		return nil, err
	}

	data.ID = dbDataset.ID
	data.OrganizationID = orgID

	return &data, nil
}

func (r *Service) List(ctx context.Context, organizationID string) ([]api.Dataset, error) {
	var datasets []api.Dataset

	dbDatasets, err := datasetquery.List(ctx, r.db, organizationID)
	if err != nil {
		return nil, err
	}

	for _, dbDataset := range dbDatasets {
		dataset := api.Dataset{
			ID:             dbDataset.ID,
			Name:           dbDataset.Name,
			Description:    dbDataset.Description,
			RetentionDays:  dbDataset.RetentionDays,
			OrganizationID: dbDataset.OrganizationID,
		}

		datasets = append(datasets, dataset)
	}
	return datasets, nil
}

func (r *Service) FindByName(ctx context.Context, organizationID, datasetName string) (*database.Dataset, error) {
	var err error

	if len(datasetName) == 0 {
		datasetName = "default"
	}

	dbDataset, err := datasetquery.SelectByName(ctx, r.db, organizationID, datasetName)
	if err != nil {
		return nil, err
	}

	return &database.Dataset{
		ID:             dbDataset.ID,
		Name:           dbDataset.Name,
		Description:    dbDataset.Description,
		RetentionDays:  dbDataset.RetentionDays,
		OrganizationID: dbDataset.OrganizationID,
	}, nil
}

func (r *Service) ListFields(ctx context.Context, organizationID, datasetID string) ([]api.DatasetField, error) {
	logKeys, err := r.ch.QueryLogFields(ctx, organizationID, datasetID)
	if err != nil {
		return nil, err
	}

	fields := make([]api.DatasetField, len(logKeys))
	for i, key := range logKeys {
		fields[i] = api.DatasetField{
			Field: key.Field,
			Type:  key.Type,
		}
	}

	return fields, nil
}

func (r *Service) TotalLogs(ctx context.Context, organizationID, datasetID string) (int, error) {
	return r.ch.QueryTotalLogs(ctx, organizationID, datasetID)
}

func (r *Service) QueryLogs(
	ctx context.Context,
	organizationID,
	datasetID string,
	startTime,
	endTime string,
	filter string,
	cursor int,
) ([]api.DatasetLog, error) {
	filterObj := api.DatasetFilter{}

	if len(filter) != 0 {
		if err := json.Unmarshal([]byte(filter), &filterObj); err != nil {
			fmt.Println(err)
			return nil, err
		}
	}

	toDateTime, err := time.Parse(time.RFC1123, endTime)
	if err != nil {
		return nil, err
	}
	fromDateTime, err := time.Parse(time.RFC1123, startTime)
	if err != nil {
		return nil, err
	}

	fmt.Printf("toDateTime: %v, fromDateTime: %v\n", toDateTime, fromDateTime)

	logs, err := r.ch.QueryLogs(ctx, organizationID, datasetID, fromDateTime, toDateTime, filterObj, cursor)
	if err != nil {
		return nil, err
	}

	return logs, nil
}
