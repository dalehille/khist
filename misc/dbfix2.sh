#!/bin/bash

context=$(kubectl config current-context 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "Error getting current context from kubectl"
    exit 1
fi

# db_file="$HOME/.khist/khist.db"
db_file="$HOME/.khist/${context}_khist.db"

# create a new table without the exit_status column
sqlite3 $db_file <<EOF
CREATE TABLE IF NOT EXISTS khist_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    command TEXT NOT NULL,
    output TEXT NOT NULL
);
EOF

# copy the data over
sqlite3 $db_file <<EOF
INSERT INTO khist_new (id, timestamp, command, output)
SELECT id, timestamp, command, output FROM khist;
EOF

# drop the old table
sqlite3 $db_file <<EOF
DROP TABLE khist;
EOF

# rename the new table to the original name
sqlite3 $db_file <<EOF
ALTER TABLE khist_new RENAME TO khist;
EOF