#!/usr/bin/env node

/* eslint-disable */

const { spawn } = require('child_process');

function openInBrowser(url) {
  if (process.platform === 'win32') {
    // cmd.exe builtin "start". The empty string is the window title.
    return spawn('cmd', ['/c', 'start', '', url], { stdio: 'ignore', detached: true });
  }
  if (process.platform === 'darwin') {
    return spawn('open', [url], { stdio: 'ignore', detached: true });
  }
  return spawn('xdg-open', [url], { stdio: 'ignore', detached: true });
}

module.exports = { openInBrowser };
