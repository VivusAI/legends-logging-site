package auth

type ErrSessionExpired struct{}

func (ErrSessionExpired) Error() string {
	return "auth session expired"
}

func (ErrSessionExpired) Is(target error) bool {
	_, ok := target.(ErrSessionExpired)
	return ok
}

type ErrUserCredentials struct{}

func (ErrUserCredentials) Error() string {
	return "username or password is wrong"
}

func (ErrUserCredentials) Is(target error) bool {
	_, ok := target.(ErrUserCredentials)
	return ok
}
