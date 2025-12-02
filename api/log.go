package api

type Log struct {
	Level    string         `json:"level"`
	Message  string         `json:"message"`
	Resource string         `json:"resource"`
	Metadata map[string]any `json:"metadata"`
}
