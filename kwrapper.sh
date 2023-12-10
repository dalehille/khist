#!/bin/bash

# a shell script that wraps the kubectl command and captures output 
# goals:
# 1. capture all output from kubectl commands and store them in a sqlite db
# timestamp, command, output, output_size should be stored in the db

# The user should create an alias for kubectl that points to this script. example:
# alias k=/Users/you/kubecapture/kwrapper.sh
# alias kd='k get deploy'
# alias kp='k get pods'
# add this as a line in your .bashrc or .zshrc file

# check if the output of this script is being displayed in the terminal. if so, use kubecolor to colorize the output
# if not, just use kubectl to get the output and don't colorize it so that it can be piped to other commands like jq
# without the color codes messing up the output
if [ -t 1 ]; then
    if command -v kubecolor &> /dev/null
    then
        original_command="kubecolor $@"
    else
        original_command="kubectl $@"
    fi
else
    original_command="kubectl $@"
fi

if [[ $original_command == *" exec "* ]]; then
    # Run the command directly and don't store its output
    $original_command 
else
    # Run the command in a pseudo-terminal and capture its output
    output=$(script -q /dev/null $original_command | cat | base64)
fi

output_size=${#output}

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
    output TEXT NOT NULL,
    output_size INTEGER NOT NULL
);
EOF

timestamp=$(date +%Y-%m-%d\ %H:%M:%S)
sqlite3 $db_file <<EOF
INSERT INTO kwrapper (timestamp, command, output, output_size) VALUES (
    "$timestamp",
    "$original_command",
    "$output",
    "$output_size"
);
EOF

# print the output of the command to stdout so that it can be piped to other commands
echo -e "$output" | base64 -d

# example sqlite3 commands to query this data:
# sqlite3 ~/.kwrapper/kind-kind_kwrapper.db "select * from kwrapper;"
# sqlite3 ~/.kwrapper/gke_myproj1_us-east1_dev01_kwrapper.db "select * from kwrapper where command like '%get pods%';"