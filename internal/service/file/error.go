package file

import "fmt"

type ListStorageError struct {
	ErrorMsg string
}

func (e ListStorageError) Error() string {
	return fmt.Sprintf("failed to list storage files: %s", e.ErrorMsg)
}

func (ListStorageError) Is(target error) bool {
	_, ok := target.(ListStorageError)
	return ok
}

type UploadStorageError struct {
	ErrorMsg string
}

func (e UploadStorageError) Error() string {
	return fmt.Sprintf("failed to upload storage file: %s", e.ErrorMsg)
}

func (UploadStorageError) Is(target error) bool {
	_, ok := target.(UploadStorageError)
	return ok
}
