package main

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	isTerminal := isOutputATerminal()

	// Determine the command to run (kubectl or kubecolor)
	commandToRun := determineCommand(os.Args[1:], isTerminal)

	// Commands to be run directly without storing their output
	directCommands := []string{" exec ", "--watch", " -w", " attach ", " port-forward ", " proxy "}

	// Check if the commandToRun contains any of the directCommands
	shouldRunDirectly := false
	for _, directCommand := range directCommands {
		if strings.Contains(commandToRun, directCommand) {
			shouldRunDirectly = true
			break
		}
	}

	// Special handling for "logs -f" and "logs --follow" as the flags can appear anywhere after "logs"
	parts := strings.Fields(commandToRun)
	for i, part := range parts {
		if part == "logs" && i < len(parts)-1 {
			remainingParts := strings.Join(parts[i+1:], " ")
			if strings.Contains(remainingParts, "-f") || strings.Contains(remainingParts, "--follow") {
				shouldRunDirectly = true
				break
			}
		}
	}

	if shouldRunDirectly {
		execCommand(commandToRun)
	} else {
		runAndStoreCommand(commandToRun)
	}
}

func isOutputATerminal() bool {
	fileInfo, _ := os.Stdout.Stat()
	return (fileInfo.Mode() & os.ModeCharDevice) != 0
}

func determineCommand(args []string, isTerminal bool) string {
	var command string
	if isTerminal {
		if foundPath, err := exec.LookPath("kubecolor"); err == nil {
			command = foundPath
		} else {
			command = "kubectl"
		}
	} else {
		command = "kubectl"
	}
	return command + " " + strings.Join(args, " ")
}

func execCommand(command string) {
	parts := strings.Fields(command)
	cmd := exec.Command(parts[0], parts[1:]...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	cmd.Run()
}

func runAndStoreCommand(command string) {
	// Wrap the command with 'script' to capture the terminal output
	scriptWrappedCommand := "script -q /dev/null " + command

	// Split the command string into the command and its arguments
	parts := strings.Fields(scriptWrappedCommand)
	cmd := exec.Command(parts[0], parts[1:]...)

	// Run the command and capture its output
	output, _ := cmd.CombinedOutput()

	outputStr := string(output)
	outputStr = strings.ReplaceAll(outputStr, "^D", "") // Remove "^D"

	encodedOutput := base64.StdEncoding.EncodeToString([]byte(outputStr))

	usr, _ := user.Current()
	homeDir := usr.HomeDir

	context, err := getCurrentKubeContext()
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error getting current context:", err)
		return
	}

	dbFilePath := filepath.Join(homeDir, ".khist", context+"_khist.db")
	os.MkdirAll(filepath.Dir(dbFilePath), os.ModePerm)

	insertDataIntoDB(dbFilePath, command, encodedOutput)

	fmt.Print(string(output))
}

func getCurrentKubeContext() (string, error) {
	output, err := exec.Command("kubectl", "config", "current-context").CombinedOutput()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(output)), nil
}

func insertDataIntoDB(dbFilePath, command, output string) {
	db, err := sql.Open("sqlite3", dbFilePath)
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error opening database:", err)
		return
	}
	defer db.Close()

	// Create table if it doesn't exist
	createTableSQL := `
    CREATE TABLE IF NOT EXISTS khist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        command TEXT NOT NULL,
        output TEXT NOT NULL,
        output_size INTEGER NOT NULL
    );
    `
	_, err = db.Exec(createTableSQL)
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error creating table:", err)
		return
	}

	timestamp := time.Now().Format("2006-01-02 15:04:05")
	outputSize := len(output)
	insertSQL := `INSERT INTO khist (timestamp, command, output, output_size) VALUES (?, ?, ?, ?)`
	_, err = db.Exec(insertSQL, timestamp, command, output, outputSize)
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error inserting data:", err)
		return
	}
}
