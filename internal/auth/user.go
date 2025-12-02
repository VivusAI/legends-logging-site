package auth

import (
	"errors"

	"github.com/fivemanage/lite/api"
	"github.com/labstack/echo/v4"
)

func CurrentUser(c echo.Context) (*api.User, error) {
	user, ok := c.Get("user").(*api.User)
	if !ok {
		return nil, errors.New("user not found in context")
	}

	return user, nil
}
