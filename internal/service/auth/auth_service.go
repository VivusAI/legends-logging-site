package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/fivemanage/lite/api"
	"github.com/fivemanage/lite/internal/auth"
	"github.com/fivemanage/lite/internal/crypt"
	"github.com/fivemanage/lite/internal/database"
	"github.com/fivemanage/lite/internal/helper/strings"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"golang.org/x/oauth2"
)

type authConfig struct {
	github *oauth2.Config
}

type Auth struct {
	config authConfig
	db     *bun.DB
}

func NewService(db *bun.DB) *Auth {
	githubConfig := auth.NewGithubConfig()

	return &Auth{
		config: authConfig{
			github: githubConfig,
		},
		db: db,
	}
}

// CreateAdminUser creates the initial admin user if none exists

func (a *Auth) CreateAdminUser() error {
	var err error
	ctx := context.Background()

	user := new(database.User)
	err = a.db.NewSelect().Model(user).Limit(1).Scan(ctx)
	if err != nil {
		// todo: create a database.selectError func
		if errors.Is(err, sql.ErrNoRows) {
			logrus.Info("Found no admin user. Attempting to create one.")
		} else {
			return err
		}
	}

	// it can only be one admin
	if user.IsAdmin {
		return nil
	}

	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		return errors.New("admin password is missing. make sure ADMIN_PASSWORD is set")
	}

	passwordHash, err := crypt.HashPassword(adminPassword)
	if err != nil {
		return err
	}

	admin := &database.User{
		Name:         "Admin",
		PasswordHash: passwordHash,
		Username:     "admin",
		IsAdmin:      true,
	}
	_, err = a.db.NewInsert().Model(admin).Exec(ctx)
	if err != nil {
		return err
	}

	logrus.Info("Successfully created admin user. Proceeding.")

	return nil
}

// RegisterUser will register the user, no shit, but we need to make sure this is
// only for non-admin users. The actual admin user should have the defalt admin password
// unless changed in ENV, and then be prompted to change it. That should probably be required.

// we will probably remove this, and init everything with an admin user which can create users instead
// .... I guess we can keep it for that thouugh
// doesnt' make much sense to have a register outside anyways
func (a *Auth) RegisterUser(ctx context.Context, register *api.RegisterRequest) (string, error) {
	exists := a.userExists(ctx, register.Email)
	if exists {
		return "", errors.New("user already exists")
	}

	userID, err := a.createUser(ctx, register)
	if err != nil {
		return "", err
	}

	sessionID, err := a.createSession(ctx, userID)
	if err != nil {
		return "", err
	}

	// not sure if we really need to return anything else than the error here
	// we can instead create a session as another call and then add that sessionId
	// as a cookie
	return sessionID, nil
}

// Login uses email and password to authenticate the user
func (a *Auth) LoginUser(ctx context.Context, username, password string) (string, error) {
	user, err := a.getUserByCredentials(ctx, username, password)
	if err != nil {
		return "", err
	}

	sessionID, err := a.createSession(ctx, user.ID)
	if err != nil {
		return "", err
	}

	// not sure if we really need to return anything else than the error here
	// we can instead create a session as another call and then add that sessionId
	// as a cookie
	return sessionID, nil
}

// OAuthLogin uses OAuth2 to authenticate the user
// This will probably work as register and login, right???
func (a *Auth) OAuthLogin() string {
	verifier := oauth2.GenerateVerifier()
	url := a.config.github.AuthCodeURL("state", oauth2.AccessTypeOffline, oauth2.S256ChallengeOption(verifier))

	return url
}

func (a *Auth) Callback(code string) *oauth2.Token {
	token, err := a.config.github.Exchange(context.TODO(), code)
	if err != nil {
		fmt.Println(err)
	}

	return token
}

// we probably dont need this function anymore...maybe
func (a *Auth) userExists(ctx context.Context, email string) bool {
	user := new(database.User)
	err := a.db.NewSelect().Model(user).Where("email = ?", email).Scan(ctx)
	if err != nil {
		fmt.Println(err)
	}

	if user.ID == 0 {
		return false
	}

	return user.ID != 0
}

// CreateUser creates a new user with email and password
func (a *Auth) createUser(ctx context.Context, register *api.RegisterRequest) (int64, error) {
	var err error
	hash, err := crypt.HashPassword(register.Password)
	if err != nil {
		fmt.Println(err)
		return 0, err
	}

	user := &database.User{
		Email:        register.Email,
		PasswordHash: hash,
	}

	// this should be a tx, so we can rollback if we fail to get the LID
	res, err := a.db.NewInsert().Model(user).Exec(ctx)
	if err != nil {
		return 0, err
	}

	// this should be the userID
	lid, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	return lid, nil
}

func (a *Auth) getUserByCredentials(ctx context.Context, username, password string) (*database.User, error) {
	var err error

	user := new(database.User)
	err = a.db.NewSelect().Model(user).Where("username = ?", username).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, &ErrUserCredentials{}
		} else {
			return nil, err
		}
	}

	err = crypt.ComparePassword(user.PasswordHash, password)
	if err != nil {
		return nil, &ErrUserCredentials{}
	}

	return user, nil
}

// not sure if this should be public or not yet
func (a *Auth) createSession(ctx context.Context, userID int64) (string, error) {
	sessionID, err := crypt.GenerateSessionID()
	if err != nil {
		return "", err
	}

	session := &database.Session{
		ID:        sessionID,
		UserID:    int(userID),
		ExpiresAt: time.Now().Add(time.Hour * 24),
	}

	_, err = a.db.NewInsert().Model(session).Exec(ctx)
	if err != nil {
		return "", nil
	}

	return session.ID, nil
}

func (a *Auth) UserBySession(ctx context.Context, sessionID string) (*api.User, error) {
	session := new(database.Session)
	err := a.db.NewSelect().Model(session).Relation("User").Where("session.id = ?", sessionID).Limit(1).Scan(ctx)
	if err != nil {
		return nil, err
	}

	if time.Now().After(session.ExpiresAt) {
		return nil, ErrSessionExpired{}
	}

	return &api.User{
		ID:       session.User.ID,
		Username: session.User.Username,
		IsAdmin:  session.User.IsAdmin,
		Name:     strings.Null(session.User.Name),
		Email:    strings.Null(session.User.Email),
		Avatar:   strings.Null(session.User.Avatar),
	}, nil
}

func (a *Auth) IsOrganizationMember(ctx context.Context, userID int64, organizationID string) (bool, error) {
	member := new(database.OrganizationMember)
	err := a.db.NewSelect().Model(member).
		Where("user_id = ? AND organization_id = ?", userID, organizationID).
		Limit(1).
		Scan(ctx)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}

func (a *Auth) LogoutUser(ctx context.Context, sessionID string) error {
	_, err := a.db.NewDelete().Model((*database.Session)(nil)).Where("id = ?", sessionID).Exec(ctx)
	return err
}

func (a *Auth) CreateSessionCookie(sessionID string) *http.Cookie {
	isProduction := os.Getenv("ENV") == "production"
	return &http.Cookie{
		Name:     "fmlite_session",
		Value:    sessionID,
		Secure:   isProduction,
		SameSite: http.SameSiteLaxMode,
		HttpOnly: true,
		Path:     "/",
		Expires:  time.Now().Add(time.Hour * 24),
	}
}

func (a *Auth) CreateLogoutCookie() *http.Cookie {
	return &http.Cookie{
		Name:     "fmlite_session",
		Value:    "",
		HttpOnly: true,
		Path:     "/",
		Expires:  time.Now().Add(-time.Hour),
		MaxAge:   -1,
	}
}
