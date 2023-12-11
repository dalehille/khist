#!/bin/bash

# directory containing the databases
db_dir="$HOME/.kwrapper"

# loop over all "_kwrapper.db" files in the directory
for db_file in "$db_dir"/*_kwrapper.db; do
    echo "Fixing $db_file"
    # create a new table with the output_size column
    sqlite3 "$db_file" <<EOF
    CREATE TABLE IF NOT EXISTS kwrapper_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        command TEXT NOT NULL,
        output TEXT NOT NULL,
        output_size INTEGER NOT NULL DEFAULT 0
    );
EOF

    # copy the data over, calculate output_size as the length of output
    sqlite3 "$db_file" <<EOF
    INSERT INTO kwrapper_new (id, timestamp, command, output, output_size)
    SELECT id, timestamp, command, output, LENGTH(output) FROM kwrapper;
EOF

    # drop the old table
    sqlite3 "$db_file" <<EOF
    DROP TABLE kwrapper;
EOF

    # rename the new table to the original name
    sqlite3 "$db_file" <<EOF
    ALTER TABLE kwrapper_new RENAME TO kwrapper;
EOF

done