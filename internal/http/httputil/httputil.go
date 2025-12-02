package httputil

type response struct {
	Status string `json:"status"`
	Data   any    `json:"data"`
}

type errorResponse struct {
	Status string    `json:"status"`
	Data   errorData `json:"data"`
}

type errorData struct {
	Message string `json:"message"`
}

func Response(data any) *response {
	return &response{
		Status: "ok",
		Data:   data,
	}
}

func ErrorResponse(message string) *errorResponse {
	return &errorResponse{
		Status: "error",
		Data: errorData{
			Message: message,
		},
	}
}
