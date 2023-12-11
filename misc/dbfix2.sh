#!/bin/bash

context=$(kubectl config current-context 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "Error getting current context from kubectl"
    exit 1
fi

# db_file="$HOME/.kwrapper/kwrapper.db"
db_file="$HOME/.kwrapper/${context}_kwrapper.db"

# create a new table without the exit_status column
sqlite3 $db_file <<EOF
CREATE TABLE IF NOT EXISTS kwrapper_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    command TEXT NOT NULL,
    output TEXT NOT NULL
);
EOF

# copy the data over
sqlite3 $db_file <<EOF
INSERT INTO kwrapper_new (id, timestamp, command, output)
SELECT id, timestamp, command, output FROM kwrapper;
EOF

# drop the old table
sqlite3 $db_file <<EOF
DROP TABLE kwrapper;
EOF

# rename the new table to the original name
sqlite3 $db_file <<EOF
ALTER TABLE kwrapper_new RENAME TO kwrapper;
EOF