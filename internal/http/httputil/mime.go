package httputil

import (
	"fmt"
	"mime/multipart"
	"strings"

	"github.com/gabriel-vasile/mimetype"
)

func GetMimeDetails(fileHeader *multipart.FileHeader, file multipart.File) (string, string, string, error) {
	var err error
	var fileType string

	// Get the file type from the header
	buf := make([]byte, fileHeader.Size)
	_, err = file.Read(buf)
	if err != nil {
		return "", "", "", fmt.Errorf("error reading file: %w", err)
	}

	mime := mimetype.Detect(buf)
	mimeType := mime.String()
	extension := mime.Extension()

	fileType = strings.Split(mime.String(), "/")[0]

	return mimeType, extension, fileType, nil
}
