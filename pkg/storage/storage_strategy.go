package storage

import (
	"context"
	"io"

	"github.com/fivemanage/lite/pkg/storage/s3"
	"github.com/spf13/viper"
)

type StorageLayer interface {
	CreateBucket(context.Context) error
	UploadFile(context.Context, io.Reader, string, string) error
	DeleteFile() error
}

func New(provider string) StorageLayer {
	switch provider {
	case "s3":
		s3Provider := viper.GetString("s3-provider")
		return s3.New(s3Provider)
	}

	return nil
}
