#!/bin/bash

# Program name
PROGRAM_NAME="khist"

# Mac Intel
# if building on m1 mac then open terminal using Rosetta 2 and run this
CGO_ENABLED=1 GOOS=darwin GOARCH=amd64 go build -o ${PROGRAM_NAME}_mac_intel main.go

# Mac M1
GOOS=darwin GOARCH=arm64 go build -o ${PROGRAM_NAME}_mac_m1 main.go

# Linux
GOOS=linux GOARCH=amd64 go build -o ${PROGRAM_NAME}_linux_amd64 main.go

# Linux arm
GOOS=linux GOARCH=arm64 go build -o ${PROGRAM_NAME}_linux_arm64 main.go

echo "Build complete"