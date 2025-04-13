#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const os = require('os');
let cliPath = path.join(__dirname, 'cli.js');
if (!require('fs').existsSync(cliPath)) {
    cliPath = path.join(__dirname, 'bin', 'cli.js');
    if (!require('fs').existsSync(cliPath)) {
        console.error("Error: cli.js not found.  Expected it in either the same directory as this script, or in a 'bin' subdirectory.");
        process.exit(1);
    }
}

const memUsage = Math.min(16384, Math.floor(os.totalmem() / 1024 / 1024 / 2));

const nodeOptions = ["--max-old-space-size=" + memUsage];
const cliArgs = process.argv.slice(2);
const command = process.execPath;

const child = spawn(command, [...nodeOptions, cliPath, ...cliArgs], {
    stdio: 'inherit',
});

child.on('error', (err) => {
    console.error(err.message);
    process.exit(1);
});

child.on('close', (code) => {
    if (code !== 0) {
        console.error(`exited with code ${code}`);
    }
    process.exit(code);
});
