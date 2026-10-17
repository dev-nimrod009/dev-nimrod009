#!/usr/bin/env node
// Simple cross-platform TCP wait script for waiting until host:port is accepting connections
// Usage: node scripts/waitForDb.js --host localhost --port 3306 --timeout 60

const net = require('net');
const argv = require('minimist')(process.argv.slice(2));

const host = argv.host || 'localhost';
const port = parseInt(argv.port, 10) || 3306;
const timeoutSec = parseInt(argv.timeout, 10) || 60;
const intervalMs = 1000;

let waited = 0;

function check() {
    const socket = new net.Socket();
    let connected = false;
    socket.setTimeout(2000);
    socket.on('connect', () => {
        connected = true;
        socket.destroy();
        console.log(`✅ Database available at ${host}:${port}`);
        process.exit(0);
    });
    socket.on('timeout', () => {
        socket.destroy();
    });
    socket.on('error', () => {
        socket.destroy();
    });
    socket.on('close', () => {
        if (!connected) {
            waited += intervalMs / 1000;
            if (waited >= timeoutSec) {
                console.error(`❌ Timed out waiting for ${host}:${port} after ${timeoutSec}s`);
                process.exit(1);
            }
            setTimeout(check, intervalMs);
        }
    });
    socket.connect(port, host);
}

console.log(`⏳ Waiting for DB at ${host}:${port} (timeout ${timeoutSec}s)...`);
check();
