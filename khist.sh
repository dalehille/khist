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
export FZF_DEFAULT_OPTS='--color=bg+:#3c3836,bg:#32302f,spinner:#fb4934,hl:#928374,fg:#ebdbb2,header:#928374,info:#8ec07c,pointer:#fb4934,marker:#fb4934,fg+:#ebdbb2,prompt:#fb4934,hl+:#fb4934'

# Use sqlite3 to get a list of all kubectl commands run in the past
# This assumes you have a table named 'kwrapper' with a 'command' column
# COMMANDS=$(sqlite3 $DB_PATH "SELECT timestamp, command FROM kwrapper")
COMMANDS=$(sqlite3 $DB_PATH "SELECT timestamp,  command FROM kwrapper")
# echo "$COMMANDS"
# works - SELECTED_COMMAND=$(echo "$COMMANDS" | fzf --reverse --preview "echo '{}' | awk '{print $1}' | xargs -I CMD sqlite3 $DB_PATH \"SELECT output FROM kwrapper WHERE command = '\"CMD\"'\" | base64 -D | less -R")
# SELECTED_COMMAND=$(echo "$COMMANDS" | fzf --reverse --preview "echo '{}' | cut -d'|' -f2- | xargs -I CMD sqlite3 $DB_PATH \"SELECT output FROM kwrapper WHERE output = '\"CMD\"'\" | base64 -D | less -R")


# SELECTED=$(echo "$COMMANDS" | fzf --reverse --preview "echo '{}'")
# SELECTED_COMMAND=$(echo "$SELECTED" | cut -d'|' -f2-)
# OUTPUT=$(sqlite3 $DB_PATH "SELECT output FROM kwrapper WHERE command = '$SELECTED_COMMAND'" | base64 -D)
# echo $OUTPUT | less -R
SELECTED_COMMAND=$(echo "$COMMANDS" | fzf --reverse --preview "echo '{}' | awk -F'|' '{print $1}' | xargs -I CMD sqlite3 $DB_PATH \"SELECT output FROM kwrapper WHERE timestamp = CMD\" | less -R")
# SELECTED_COMMAND=$(echo "$COMMANDS" |  awk -F'|' '{print $1}' | fzf --reverse --preview "echo '{}' | awk -F'|' '{print $1}' | xargs -I CMD sqlite3 $DB_PATH \"SELECT output FROM kwrapper WHERE timestamp = CMD\" | less -R")

# SELECTED_COMMAND=$(echo "$COMMANDS" | fzf --reverse --preview "echo '{}' | awk -F'|' '{print $1}' ")

# SELECTED_COMMAND=$(echo "$COMMANDS" | fzf --reverse --preview "echo '{}' | cut -d'|' -f1 | less -R")

# Use fzf for interactive filtering of the commands
# SELECTED_COMMAND=$(echo "$COMMANDS" | fzf --reverse --preview "echo '{}' | base64 --decode | less -R")
# SELECTED_COMMAND=$(echo "$COMMANDS" | fzf --reverse --preview "echo '{}' | xargs -I CMD sqlite3 $DB_PATH \"SELECT output FROM kwrapper WHERE command = CMD\" | less -R")
# SELECTED_COMMAND=$(echo "$COMMANDS" | fzf --reverse --preview "echo '{}' | xargs -I CMD printf '%q' CMD | xargs -I ESCAPED_CMD sqlite3 $DB_PATH \"SELECT output FROM kwrapper WHERE command = ESCAPED_CMD\" | less -R")

# Display the output of the selected command
# This assumes you have an 'output' column in the same table
# OUTPUT=$(sqlite3 $DB_PATH "SELECT output FROM kwrapper WHERE command = '$SELECTED_COMMAND'")
# echo $OUTPUT