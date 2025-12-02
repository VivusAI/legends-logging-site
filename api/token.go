package api

type CreateTokenRequest struct {
	Identifier     string `json:"identifier"`
	Type           string `json:"type"`
	OrganizationID string `json:"omitzero"`
}

type CreateTokenResponse struct {
	Token string `json:"token"`
}

type ListTokensResponse struct {
	ID         int64  `json:"id"`
	Identifier string `json:"identifier"`
}
