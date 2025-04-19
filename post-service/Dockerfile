# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy dependency files first (for layer caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy all source files
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /usr/local/bin/app .

# Runtime stage
FROM alpine:latest
RUN apk add --no-cache ca-certificates

WORKDIR /root/
COPY --from=builder /usr/local/bin/app .
COPY .env ./

EXPOSE 4000
CMD ["./app"]