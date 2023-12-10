#!/bin/bash

# a script that acts as a viewer for the kwrapper sqlite db so the user doesn't have to run sqlite3 commands
# incorporates fzf for interactive filtering.
# running khist.sh should show the user a list of all kubectl commands they've run in the past
# the user should be able to filter the list by typing in a search term
# the user should be able to select a command from the list and see the output of that command on the right side of the screen

# Define the path to your SQLite database
# this should be the same as the users kube context

# DB_PATH="$HOME/.kwrapper/kind-kind_kwrapper.db"
# DB_PATH="$HOME/.kwrapper/microk8s_kwrapper.db"
# this should be set to the current kube context
DB_PATH="$HOME/.kwrapper/$(kubectl config current-context)_kwrapper.db"

# morhetz/gruvbox
# export FZF_DEFAULT_OPTS='--color=bg+:#3c3836,bg:#32302f,spinner:#fb4934,hl:#928374,fg:#ebdbb2,header:#928374,info:#8ec07c,pointer:#fb4934,marker:#fb4934,fg+:#ebdbb2,prompt:#fb4934,hl+:#fb4934'
# export FZF_DEFAULT_OPTS='--color=bg+:#4c4846,bg:#423c3a,spinner:#fc6955,hl:#a29884,fg:#fcf6c2,header:#a29884,info:#9edc7d,pointer:#fc6955,marker:#fc6955,fg+:#fcf6c2,prompt:#fc6955,hl+:#fc6955'
# export FZF_DEFAULT_OPTS='--color=bg+:#4c4846,bg:#423c3a,spinner:#fc6955,hl:#a29884,fg:#fcf6c2,header:#a29884,info:#9edc7d,pointer:#fc6955,marker:#fc6955,fg+:#000000,prompt:#fc6955,hl+:#ffff00'
# export FZF_DEFAULT_OPTS='--color=bg+:#4c4846,bg:#423c3a,spinner:#fc6955,hl:#a29884,fg:#fcf6c2,header:#a29884,info:#9edc7d,pointer:#fc6955,marker:#fc6955,fg+:#ffffff,prompt:#fc6955,hl+:#0000ff'
# export FZF_DEFAULT_OPTS='--color=bg+:#4c4846,bg:#423c3a,spinner:#fc6955,hl:#a29884,fg:#fcf6c2,header:#a29884,info:#9edc7d,pointer:#fc6955,marker:#fc6955,fg+:#98FB98,prompt:#fc6955,hl+:#0000ff'
# export FZF_DEFAULT_OPTS='--color=bg+:#4c4846,bg:#423c3a,spinner:#fc6955,hl:#a29884,fg:#fcf6c2,header:#a29884,info:#9edc7d,pointer:#32CD32,marker:#fc6955,fg+:#98FB98,prompt:#fc6955,hl+:#0000ff'
# export FZF_DEFAULT_OPTS='--color=bg+:#4c4846,bg:#423c3a,spinner:#fc6955,hl:#a29884,fg:#fcf6c2,header:#a29884,info:#9edc7d,pointer:#32CD32,marker:#32CD32,fg+:#98FB98,prompt:#fc6955,hl+:#0000ff'
export FZF_DEFAULT_OPTS='--color=bg+:#4c4846,bg:#423c3a,spinner:#fc6955,hl:#a29884,fg:#fcf6c2,header:#a29884,info:#9edc7d,pointer:#32CD32,marker:#32CD32,fg+:#98FB98,prompt:#fc6955,hl+:#32CD32'

# Use sqlite3 to get a list of all kubectl commands run in the past
# This assumes you have a table named 'kwrapper' with a 'command' column
COMMANDS=$(sqlite3 $DB_PATH "SELECT id, timestamp, output_size, command FROM kwrapper")
# echo "$COMMANDS | fzf --reverse"

# Display the output of the selected command
# This assumes you have an 'output' column in the same table
# OUTPUT=$(sqlite3 $DB_PATH "SELECT output FROM kwrapper WHERE command = '$SELECTED_COMMAND'")
# echo $OUTPUT


# Use fzf to select a command and cut to get the ID
# SELECTED_COMMAND_ID=$(echo "$COMMANDS" | fzf --reverse | cut -d '|' -f 1)
SELECTED_COMMAND_ID=$(echo "$COMMANDS" | fzf --reverse --bind 'ctrl-j:down,ctrl-k:up' | cut -d '|' -f 1)

# Fetch the output of the selected command using the ID
OUTPUT_BASE64=$(sqlite3 $DB_PATH "SELECT output FROM kwrapper WHERE id = '$SELECTED_COMMAND_ID'")

# Decode the base64 output
OUTPUT=$(echo "$OUTPUT_BASE64" | base64 --decode)

# Display the output
printf "%b\n" "$OUTPUT"