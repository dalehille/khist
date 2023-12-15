#!/bin/bash

context=$(kubectl config current-context 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "Error getting current context from kubectl"
    exit 1
fi

# db_file="$HOME/.khist/khist.db"
db_file="$HOME/.khist/${context}_khist.db"

sqlite3 $db_file <<EOF
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS khist_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    command TEXT NOT NULL,
    output TEXT NOT NULL,
    exit_status INTEGER NOT NULL
);
INSERT INTO khist_new(timestamp, command, output, exit_status) SELECT timestamp, command, output, exit_status FROM khist;
DROP TABLE khist;
ALTER TABLE khist_new RENAME TO khist;
COMMIT;
EOF