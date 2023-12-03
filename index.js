// nodejs server for khist. 
// calls sqlite3 kwrapper database and returns json data
// The database schema is defined in kwrapper.sh and looks like:
// CREATE TABLE IF NOT EXISTS "kwrapper" (
//    id INTEGER PRIMARY KEY AUTOINCREMENT,
//    timestamp TEXT NOT NULL,
//    command TEXT NOT NULL,
//    output TEXT NOT NULL,
//    exit_status INTEGER NOT NULL
//);
// there should be a route that returns all the data in the database
// there should be a route that returns the data for an id
// The 'output' data in the database is base64 encoded, so it needs to be decoded before being returned. It was created using the unix "script -q" command, 
// and would contain color codes and other formatting. This needs to be sent to the client in a way that it can be displayed in a browser.
// this will only run on the local machine, so no need for authentication or cors restrictions
// the database is located in the home directory of a user in a .kwrapper directory and it is prefixed with the kubernetes context, for example: /Users/dale/.kwrapper/kind-kind_kwrapper.db
// 

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const atob = require('atob');
const chokidar = require('chokidar');
const WebSocket = require('ws');

const os = require('os');

const cors = require('cors');

const wss = new WebSocket.Server({ port: 8675 });

const app = express();
app.use(cors());


// return a list of databases
// the database name is the kubernetes context they will be prefixed with the kubernetes context, for example: ${os.homedir()}/.kwrapper/kind-kind_kwrapper.db
// look in the .kwrapper directory and return a list of files that end in _kwrapper.db
app.get('/dbs', (req, res) => {
    console.log('in /dbs');
    const fs = require('fs');
    const path = require('path');
    const directoryPath = `${os.homedir()}/.kwrapper`;

    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        let databases = [];
        files.forEach(function (file) {
            if (file.endsWith('_kwrapper.db')) {
                databases.push(file.replace('_kwrapper.db', ''));
            }
        });
        res.json(databases);
    });
});


app.get('/data/:dbName', (req, res) => {
    let dbPath = `${os.homedir()}/.kwrapper/${req.params.dbName}_kwrapper.db`;
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

    db.all(`SELECT id, timestamp, command, exit_status FROM kwrapper`, [], (err, rows) => {
        if (err) {
            console.log(`error in /data/:dbName route: ${err}`)
            return res.status(400).json({ error: 'dbName error', message: err });
        }
        // Send the initial data to the UI
        res.json(rows);

        // Watch for changes in the database file
        let watcher = chokidar.watch(dbPath);
        watcher.on('change', () => {
            // When the database file changes, query the data and send it to all connected WebSocket clients
            db.all(`SELECT id, timestamp, command, exit_status FROM kwrapper`, [], (err, updatedRows) => {
                if (err) {
                    console.log(`error in /data/:dbName route: ${err}`)
                    return;
                }
                // Send the updated data to all connected WebSocket clients
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
    console.log(req.params.dbName);
    console.log(`id: ${req.params.id}`)
    if (!req.params.id || req.params.id === 'undefined') {
        console.log('Missing id parameter')
        return res.status(400).json({ error: 'Missing id parameter' });
    } else if (!req.params.dbName) {
        return res.status(400).json({ error: 'Missing dbName parameter' });
    }
    let db = new sqlite3.Database(`${os.homedir()}/.kwrapper/${req.params.dbName}_kwrapper.db`, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('/data/dbName/ - Connected to the kwrapper database.');
    });

    console.log(`SELECT * FROM kwrapper WHERE id = ${req.params.id}`);
    db.get(`SELECT * FROM kwrapper WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) {
            throw err;
        }
        if (row) {
            row.output = atob(row.output); // decode base64
            res.json(row);
        } else {
            res.status(404).send('Not found');
        }
    });
});

// a route that lets you delete a row
app.delete('/data/:dbName/:id', (req, res) => {
    let db = new sqlite3.Database(`${os.homedir()}/.kwrapper/${req.params.dbName}_kwrapper.db`, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the kwrapper database.');
    });

    db.run(`DELETE FROM kwrapper WHERE id = ?`, [req.params.id], (err) => {
        if (err) {
            throw err;
        }
        res.status(200).send('OK');
    });
});

app.listen(3003, () => {
    console.log('Server is running on port 3003');
});


