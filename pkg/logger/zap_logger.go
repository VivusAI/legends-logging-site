package logger

import (
	"github.com/sirupsen/logrus"
)

func NewLogger() {
	textFormatter := new(logrus.TextFormatter)
	textFormatter.FullTimestamp = true
	textFormatter.TimestampFormat = "2006-01-02 15:04:05"
	textFormatter.PadLevelText = true
	logrus.SetFormatter(textFormatter)
}
