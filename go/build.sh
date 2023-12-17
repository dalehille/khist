#!/bin/bash

# Program name
PROGRAM_NAME="khist"

# Mac Intel
GOOS=darwin GOARCH=amd64 go build -o ${PROGRAM_NAME}_mac_intel main.go

# Mac M1
GOOS=darwin GOARCH=arm64 go build -o ${PROGRAM_NAME}_mac_m1 main.go

# Linux
GOOS=linux GOARCH=amd64 go build -o ${PROGRAM_NAME}_linux main.go

echo "Build complete"