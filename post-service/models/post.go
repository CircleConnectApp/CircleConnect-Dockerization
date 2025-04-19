package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)


type Post struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      int                `bson:"user_id" json:"user_id"`
	CommunityID int                `bson:"community_id,omitempty" json:"community_id,omitempty"`
	Title       string             `bson:"title" json:"title"`
	Content     string             `bson:"content" json:"content"`
	MediaURLs   []string           `bson:"media_urls,omitempty" json:"media_urls,omitempty"`
	Tags        []string           `bson:"tags,omitempty" json:"tags,omitempty"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}


type PostResponse struct {
	Post     Post   `json:"post"`
	UserName string `json:"user_name"`
	UserPic  string `json:"user_pic,omitempty"`
}


type CreatePostRequest struct {
	CommunityID int      `json:"community_id,omitempty"`
	Title       string   `json:"title" binding:"required"`
	Content     string   `json:"content" binding:"required"`
	MediaURLs   []string `json:"media_urls,omitempty"`
	Tags        []string `json:"tags,omitempty"`
}
