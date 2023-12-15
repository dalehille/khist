// nodejs server for khist. 
// calls sqlite3 khist database and returns json data
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const atob = require('atob');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const path = require('path');
const os = require('os');
const cors = require('cors');

const wss = new WebSocket.Server({ port: 8675 });
const app = express();
app.use(cors());

// return a list of databases
// the database name is the kubernetes context they will be prefixed with the kubernetes context, for example: ${os.homedir()}/.khist/kind-kind_khist.db
// look in the .khist directory and return a list of files that end in _khist.db
app.get('/dbs', (req, res) => {
    console.log('in /dbs');
    const fs = require('fs');
    const path = require('path');
    const directoryPath = `${os.homedir()}/.khist`;

    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        let databases = [];
        files.forEach(function (file) {
            if (file.endsWith('_khist.db')) {
                databases.push(file.replace('_khist.db', ''));
            }
        });
        res.json(databases);
    });
});


app.get('/data/:dbName', (req, res) => {
    let dbPath = `${os.homedir()}/.khist/${req.params.dbName}_khist.db`;
    if (!req.params.dbName || req.params.dbName === 'undefined') {
        return res.status(400).json({ error: 'Missing id parameter' });
    } else if (!req.params.dbName) {
        return res.status(400).json({ error: 'Missing dbName parameter' });
    }

    let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
    });

    db.all(`SELECT id, timestamp, command, output_size FROM khist`, [], (err, rows) => {
        if (err) {
            console.log(`error in /data/:dbName route: ${err}`)
            return res.status(500).json([]);
        }
        // Format the command field to in case it contains a path like /usr/homebrew/bin/kubecolor
        rows.forEach(row => {
            row.command = path.basename(row.command);
        });
        // Send the initial data to the UI
        res.json(rows);

        // Watch for changes in the database file
        let watcher = chokidar.watch(dbPath);
        watcher.on('change', () => {
            // When the database file changes, query the data and send it to all connected WebSocket clients
            db.all(`SELECT id, timestamp, command, output_size FROM khist`, [], (err, updatedRows) => {
                if (err) {
                    console.log(`error in /data/:dbName route: ${err}`)
                    return res.status(500).json([]);
                }
                // Format the command field
                updatedRows.forEach(row => {
                    row.command = path.basename(row.command);
                });
                // Send the updated data to all connected WebSocket clients
                updatedRows = Array.isArray(updatedRows) ? updatedRows : [updatedRows];
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(updatedRows));
                    }
                });
            });
        });
    });
});

// return just one row
app.get('/data/:dbName/:id', (req, res) => {
    if (!req.params.id || req.params.id === 'undefined') {
        console.log('Missing id parameter')
        return res.status(400).json({ error: 'Missing id parameter' });
    } else if (!req.params.dbName) {
        return res.status(400).json({ error: 'Missing dbName parameter' });
    }
    let db = new sqlite3.Database(`${os.homedir()}/.khist/${req.params.dbName}_khist.db`, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
    });

    console.log(`SELECT * FROM khist WHERE id = ${req.params.id}`);
    db.get(`SELECT * FROM khist WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) {
            throw err;
        }
        if (row) {
            row.output = atob(row.output); // decode base64
            row.command = path.basename(row.command); // remove path from command in case it contains a path like /usr/homebrew/bin/kubecolor
            res.json(row);
        } else {
            res.status(404).send('Not found');
        }
    });
});

// a route that lets you delete a row
app.delete('/data/:dbName/:id', (req, res) => {
    console.log(`delete id: ${req.params.id}`)
    let db = new sqlite3.Database(`${os.homedir()}/.khist/${req.params.dbName}_khist.db`, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Database error', error: err.message });
        }
    });

    db.run(`DELETE FROM khist WHERE id = ?`, [req.params.id], (err) => {
        if (err) {
            res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).send('OK');
    });
});

app.listen(3003, () => {
    console.log('Server is running on port 3003');
});


