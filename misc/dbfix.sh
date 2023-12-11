#!/bin/bash

context=$(kubectl config current-context 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "Error getting current context from kubectl"
    exit 1
fi

# db_file="$HOME/.kwrapper/kwrapper.db"
db_file="$HOME/.kwrapper/${context}_kwrapper.db"

sqlite3 $db_file <<EOF
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS kwrapper_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    command TEXT NOT NULL,
    output TEXT NOT NULL,
    exit_status INTEGER NOT NULL
);
INSERT INTO kwrapper_new(timestamp, command, output, exit_status) SELECT timestamp, command, output, exit_status FROM kwrapper;
DROP TABLE kwrapper;
ALTER TABLE kwrapper_new RENAME TO kwrapper;
COMMIT;
EOF