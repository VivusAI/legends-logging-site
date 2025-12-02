package file

import (
	"fmt"

	"github.com/fivemanage/lite/internal/crypt"
)

func generateFileKey(organizationID string, ext string) (string, error) {
	filename, err := crypt.GenerateFilename()
	if err != nil {
		return "", err
	}

	key := fmt.Sprintf("%s/%s%s", organizationID, filename, ext)
	return key, nil
}

func generateWebKey(organizationID, filename string) string {
	key := fmt.Sprintf("%s/%s", organizationID, filename)
	return key
}
