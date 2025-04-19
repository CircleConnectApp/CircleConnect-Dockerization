package main

import (
	"context"
	"log"
	"os"

	"github.com/CircleConnectApp/post-service/config"
	"github.com/CircleConnectApp/post-service/database"
	"github.com/CircleConnectApp/post-service/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	cfg := config.LoadConfig()

	client, err := database.ConnectDB(cfg.MongoURI)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer client.Disconnect(context.Background())
	log.Println("Connected to MongoDB")

	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	routes.SetupRoutes(router, client.Database(cfg.DBName))

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	log.Printf("Server running on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
