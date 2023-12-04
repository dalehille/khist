#!/bin/bash

# a shell script that wraps the kubectl command and captures output 
# goals:
# 1. capture all output from kubectl commands and store them in a sqlite db
# timestamp, command, output should be stored in the db

# The user should create an alias for kubectl that points to this script. example:
# alias kubectl="/Users/you/kwrapper.sh"
# add this as a line in your .bashrc or .zshrc file

# original_command="kubectl $@"
# Check if kubecolor command exists
if command -v kubecolor &> /dev/null
then
    original_command="kubecolor $@"
else
    original_command="kubectl $@"
fi
output=$(script -q /dev/null $original_command | cat | base64) 
# exit_status=${PIPESTATUS[0]}
# echo $exit_status
# exit_status=$?

# create a sqlite db if it doesn't exist. put it in the home directory of the user in .kwrapper
# create a table called kwrapper with columns: timestamp, command, output
# insert the values into the table
# we should have one database file per kube context. the db file should be named after the kube context
context=$(kubectl config current-context 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "Error getting current context from kubectl"
    exit 1
fi

db_file="$HOME/.kwrapper/${context}_kwrapper.db"

# create the directory if it doesn't exist
mkdir -p $(dirname $db_file)

# create db and table if they don't exist
sqlite3 $db_file <<EOF
CREATE TABLE IF NOT EXISTS kwrapper (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    command TEXT NOT NULL,
    output TEXT NOT NULL
);
EOF
    # exit_status INTEGER NOT NULL

# INSERT INTO kwrapper (timestamp, command, output, exit_status) VALUES (
timestamp=$(date +%Y-%m-%d\ %H:%M:%S)
sqlite3 $db_file <<EOF
INSERT INTO kwrapper (timestamp, command, output) VALUES (
    "$timestamp",
    "$original_command",
    "$output"
);
EOF

# print the output of the command to stdout so that it can be piped to other commands
echo -e "$output" | base64 -d

# exit with the same exit status as the original command
# exit $exit_status

# example sqlite3 commands to query this data:
# sqlite3 ~/.kwrapper/kind-kind_kwrapper.db "select * from kwrapper;"
# sqlite3 ~/.kwrapper/gke_myproj1_us-east1_dev01_kwrapper.db "select * from kwrapper where command like '%get pods%';"