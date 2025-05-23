package main

import (
	"context"
	"fmt"
	"log"
	nethttp "net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/fivemanage/lite/internal/database"
	"github.com/fivemanage/lite/internal/http"
	"github.com/fivemanage/lite/internal/service/auth"
	"github.com/fivemanage/lite/internal/service/file"
	"github.com/fivemanage/lite/internal/service/organization"
	"github.com/fivemanage/lite/internal/service/token"
	"github.com/fivemanage/lite/internal/storage"
	"github.com/fivemanage/lite/migrate"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var rootCmd = &cobra.Command{
	Use:   "fivemanage",
	Short: "Open-source, easy-to-use gaming-community management service.",
	Run: func(cmd *cobra.Command, args []string) {
		var err error

		port := viper.GetInt("port")
		driver := viper.GetString("driver")
		if driver == "" {
			logrus.Fatal("Database driver is required. Please set the DB_DRIVER environment variable or use the --driver flag.")
		}

		dsn := viper.GetString("dsn")
		if dsn == "" {
			logrus.Fatal("Database DSN is required. Please set the DSN environment variable or use the --dsn flag.")
		}

		logrus.Info("Starting Fivemanage...")

		db := database.New(driver)
		store := db.Connect(dsn)

		migrate.InitMigration(cmd.Context(), store)
		migrate.AutoMigrate(cmd.Context(), store)

		storageLayer := storage.New("s3")

		authservice := auth.New(store)
		tokenservice := token.NewService(store)
		fileservice := file.NewService(store, storageLayer)
		organizationservice := organization.NewService(store)

		server := http.NewServer(
			authservice,
			tokenservice,
			fileservice,
			organizationservice,
		)

		// todo: check if we have an admin user
		// if not, create an admin user with the ADMIN_PASSWORD ENV
		err = authservice.CreateAdminUser()
		if err != nil {
			logrus.WithError(err).Error("Failed to create admin user")
			return
		}

		srv := &nethttp.Server{
			Addr:    fmt.Sprintf(":%d", port),
			Handler: server,
		}

		go func() {
			fmt.Printf("Server is running on port %d...\n", port)
			if err := srv.ListenAndServe(); err != nil && err != nethttp.ErrServerClosed {
				log.Fatalf("listen: %s\n", err)
			}
		}()

		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit
		log.Println("Shutdown Server ...")

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := srv.Shutdown(ctx); err != nil {
			log.Fatal("Server Shutdown:", err)
		}
		select {
		case <-ctx.Done():
			log.Println("timeout of 5 seconds.")
		}
		log.Println("Server exiting")
	},
}

func init() {
	err := godotenv.Load()
	// TODO: Only for development
	if err != nil {
		log.Println("Error loading .env file. Probably becasue we're in production")
	}

	rootCmd.PersistentFlags().String("driver", "mysql", "Database driver")
	rootCmd.Flags().Int("port", 8080, "Port to serve Fivemanage")
	rootCmd.Flags().String("dsn", "", "Database DSN")

	if err := viper.BindPFlag("driver", rootCmd.PersistentFlags().Lookup("driver")); err != nil {
		envBindError(err)
	}

	if err := viper.BindPFlag("port", rootCmd.Flags().Lookup("port")); err != nil {
		envBindError(err)
	}

	if err := viper.BindPFlag("dsn", rootCmd.Flags().Lookup("dsn")); err != nil {
		envBindError(err)
	}

	if err := viper.BindEnv("driver", "DB_DRIVER"); err != nil {
		envBindError(err)
	}

	if err := viper.BindEnv("port", "PORT"); err != nil {
		envBindError(err)
	}

	if err := viper.BindEnv("dsn", "DSN"); err != nil {
		envBindError(err)
	}

	rootCmd.AddCommand(migrate.RootCmd)
	migrate.RootCmd.AddCommand(
		migrate.InitCmd,
		migrate.MigrateCmd,
		migrate.CreateMigrationCmd,
		migrate.UnlockCmd,
		migrate.LockCmd,
	)
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		panic(err)
	}
}

func envBindError(err error) {
	if err != nil {
		logrus.WithError(err).Error("Failed to bind environment variable")
		os.Exit(1)
	}
}
