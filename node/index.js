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
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8675 });
const app = express();
app.use(cors());

// Create a map to store clients and their corresponding databases
let clientDbMap = new Map();

// When a client connects, store the database they're interested in
wss.on('connection', (ws, req) => {
    const dbName = req.url.split('/')[2];
    clientDbMap.set(ws, dbName);

    ws.on('close', () => {
        clientDbMap.delete(ws);
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});

// When a client disconnects, remove them from the map
wss.on('close', (ws) => {
    clientDbMap.delete(ws);
});

function handleDatabaseQuery(dbPath, sql, params, callback) {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Could not connect to database', err);
            return callback(err, null);
        }
    });

    db.all(sql, params, (err, rows) => {
        db.close();
        if (err) {
            console.error('Error running sql: ' + sql);
            console.error(err);
            return callback(err, null);
        } else {
            return callback(null, rows);
        }
    });
}

const directoryPath = `${os.homedir()}/.khist`;
const dbWatcher = chokidar.watch(`${directoryPath}/*.db`, {
    ignoreInitial: true
});
dbWatcher.on('change', (changedPath) => {
    const dbName = path.basename(changedPath, '_khist.db');
    // Notify relevant WebSocket clients about the update
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && clientDbMap.get(client) === dbName) {
            // Re-run the query for updated data and send via WebSocket
            const sql = `SELECT id, timestamp, command, output_size FROM khist`;
            handleDatabaseQuery(changedPath, sql, [], (err, rows) => {
                if (!err) {
                    client.send(JSON.stringify(rows));
                }
            });
        }
    });
});

// return a list of databases
// the database name is the kubernetes context they will be prefixed with the kubernetes context, for example: ${os.homedir()}/.khist/kind-kind_khist.db
// look in the .khist directory and return a list of files that end in _khist.db
app.get('/dbs', (req, res) => {
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            console.error('Unable to scan directory:', err);
            return res.status(500).send('Unable to scan directory');
        }
        const databases = files.filter(file => file.endsWith('_khist.db'))
            .map(file => file.replace('_khist.db', ''));
        res.json(databases);
    });
});

app.get('/data/:dbName', (req, res) => {
    if (!req.params.dbName) {
        return res.status(400).json({ error: 'Missing dbName parameter' });
    }

    let dbPath = `${os.homedir()}/.khist/${req.params.dbName}_khist.db`;
    const sql = `SELECT id, timestamp, command, output_size FROM khist`;
    handleDatabaseQuery(dbPath, sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error querying database' });
        }
        // Format the command field to in case it contains a path like /usr/homebrew/bin/kubecolor
        rows.forEach(row => {
            const parts = row.command.split(' ');
            parts[0] = path.basename(parts[0]);
            row.command = parts.join(' ');
        });
        res.json(rows);
    });
});

// return just one row
app.get('/data/:dbName/:id', (req, res) => {
    if (!req.params.dbName || req.params.dbName === 'undefined') {
        return res.status(400).json({ error: 'Missing dbName parameter' });
    }

    if (!req.params.id || req.params.id === 'undefined') {
        return res.status(400).json({ error: 'Missing id parameter' });
    }

    let dbPath = `${os.homedir()}/.khist/${req.params.dbName}_khist.db`;
    const sql = `SELECT * FROM khist WHERE id = ?`;

    handleDatabaseQuery(dbPath, sql, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error querying database' });
        }
        if (rows.length > 0) {
            let row = rows[0];
            row.output = atob(row.output); // Decode base64
            const parts = row.command.split(' ');
            parts[0] = path.basename(parts[0]);
            row.command = parts.join(' ');
            res.json(row);
        } else {
            res.status(404).send('Not found');
        }
    });
});

function executeDatabaseCommand(dbPath, sql, params, callback) {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Could not connect to database', err);
            return callback(err);
        }
    });

    db.run(sql, params, function (err) {
        db.close();
        if (err) {
            console.error('Error running sql: ' + sql);
            console.error(err);
            return callback(err);
        } else {
            return callback(null, this.changes); // 'this.changes' gives the number of rows affected
        }
    });
}

// a route that lets you delete a row
app.delete('/data/:dbName/:id', (req, res) => {
    if (!req.params.dbName || req.params.dbName === 'undefined') {
        return res.status(400).json({ error: 'Missing dbName parameter' });
    }

    if (!req.params.id || req.params.id === 'undefined') {
        return res.status(400).json({ error: 'Missing id parameter' });
    }

    let dbPath = `${os.homedir()}/.khist/${req.params.dbName}_khist.db`;
    const sql = `DELETE FROM khist WHERE id = ?`;

    executeDatabaseCommand(dbPath, sql, [req.params.id], (err, changes) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', message: err.message });
        }
        if (changes > 0) {
            res.status(200).send('OK');
        } else {
            res.status(404).send('Not found');
        }
    });
});

app.listen(3003, () => {
    console.log('Server is running on port 3003');
});
