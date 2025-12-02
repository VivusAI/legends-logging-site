package api

type Organization struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type CreateOrganizationRequest struct {
	Name string `json:"name"`
}
