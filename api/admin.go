package api

type CreateMemberRequest struct {
	Username string `json:"username" validate:"required"`
	Email    string `json:"email"`
}

// we should probably, probably probably use protobufs this point
type CreateMemberResponse struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
