#!/bin/bash

# directory containing the databases
db_dir="$HOME/.khist"

# loop over all "_khist.db" files in the directory
for db_file in "$db_dir"/*_khist.db; do
    echo "Updating $db_file"
    
    # rename the table from 'kwrapper' to 'khist'
    sqlite3 "$db_file" <<EOF
    ALTER TABLE kwrapper RENAME TO khist;
EOF

#     echo "Fixing $db_file"
#     # create a new table with the output_size column
#     sqlite3 "$db_file" <<EOF
#     CREATE TABLE IF NOT EXISTS khist_new (
#         id INTEGER PRIMARY KEY AUTOINCREMENT,
#         timestamp TEXT NOT NULL,
#         command TEXT NOT NULL,
#         output TEXT NOT NULL,
#         output_size INTEGER NOT NULL DEFAULT 0
#     );
# EOF

#     # copy the data over, calculate output_size as the length of output
#     sqlite3 "$db_file" <<EOF
#     INSERT INTO khist_new (id, timestamp, command, output, output_size)
#     SELECT id, timestamp, command, output, LENGTH(output) FROM khist;
# EOF

#     # drop the old table
#     sqlite3 "$db_file" <<EOF
#     DROP TABLE khist;
# EOF

#     # rename the new table to the original name
#     sqlite3 "$db_file" <<EOF
#     ALTER TABLE khist_new RENAME TO khist;
# EOF

done