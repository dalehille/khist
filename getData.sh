#!/bin/bash

# a script that acts as a viewer for the sqlite dbs so the user doesn't have to run sqlite3 commands
# incorporates fzf for interactive filtering.
# running khist.sh should show the user a list of all kubectl commands they've run in the past

export FZF_DEFAULT_OPTS='--color=bg+:#4c4846,bg:#423c3a,spinner:#fc6955,hl:#a29884,fg:#fcf6c2,header:#a29884,info:#9edc7d,pointer:#32CD32,marker:#32CD32,fg+:#98FB98,prompt:#fc6955,hl+:#32CD32'

DB_PATH="$HOME/.khist/$(kubectl config current-context)_khist.db"
COMMANDS=$(sqlite3 $DB_PATH "SELECT id, timestamp, output_size, command FROM khist")
SELECTED_COMMAND_ID=$(echo "$COMMANDS" | fzf --reverse --bind 'ctrl-j:down,ctrl-k:up' | cut -d '|' -f 1)
OUTPUT_BASE64=$(sqlite3 $DB_PATH "SELECT output FROM khist WHERE id = '$SELECTED_COMMAND_ID'")
OUTPUT=$(echo "$OUTPUT_BASE64" | base64 --decode)

printf "%b\n" "$OUTPUT"