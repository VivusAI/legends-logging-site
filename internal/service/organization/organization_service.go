package organization

import (
	"context"

	"github.com/fivemanage/lite/api"
	"github.com/fivemanage/lite/internal/crypt"
	"github.com/fivemanage/lite/internal/database"
	organizationquery "github.com/fivemanage/lite/internal/database/query/organization"
	"github.com/uptrace/bun"
)

type Service struct {
	db *bun.DB
}

func NewService(db *bun.DB) *Service {
	return &Service{
		db: db,
	}
}

func (r *Service) CreateOrganization(ctx context.Context, data *api.CreateOrganizationRequest, userID int64) (*api.Organization, error) {
	orgId, err := crypt.GeneratePrimaryKey()
	if err != nil {
		return nil, err
	}

	dbOrganization := &database.Organization{
		Name: data.Name,
		ID:   orgId,
	}

	orgTx, err := organizationquery.Create(ctx, r.db, dbOrganization)
	if err != nil {
		return nil, err
	}
	if err := orgTx.Commit(); err != nil {
		return nil, err
	}

	memberTx, err := organizationquery.CreateMember(ctx, r.db, &database.OrganizationMember{
		Role:           "ADMIN",
		OrganizationID: dbOrganization.ID,
		UserID:         userID,
	})
	if err != nil {
		return nil, err
	}

	if err := memberTx.Commit(); err != nil {
		if err := orgTx.Rollback(); err != nil {
			return nil, err
		}
		return nil, err
	}

	organization := &api.Organization{
		ID:   dbOrganization.ID,
		Name: dbOrganization.Name,
	}

	return organization, nil
}

func (r *Service) FindOrganizationByID(ctx context.Context, ID string) (*api.Organization, error) {
	dbOrganization, err := organizationquery.Find(ctx, r.db, ID)
	if err != nil {
		return nil, err
	}

	organization := &api.Organization{
		ID:   dbOrganization.ID,
		Name: dbOrganization.Name,
	}

	return organization, nil
}

func (r *Service) ListOrganizations(ctx context.Context) ([]*api.Organization, error) {
	dbOrganizations, err := organizationquery.List(ctx, r.db)
	if err != nil {
		return nil, err
	}

	organizations := make([]*api.Organization, 0, len(dbOrganizations))
	for _, dbOrganization := range dbOrganizations {
		organization := &api.Organization{
			ID:   dbOrganization.ID,
			Name: dbOrganization.Name,
		}

		organizations = append(organizations, organization)
	}

	return organizations, nil
}
