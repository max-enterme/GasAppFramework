#!/usr/bin/env node

/**
 * GAS URL Generator Script
 *
 * Usage:
 *   node scripts/gas-url.js [type] [open]
 *
 * Types:
 *   project     - Edit URL (default)
 *   dev         - Web App dev URL
 *   exec        - Web App exec URL
 *
 * If 'open' is provided as the second argument, the URL will be opened in the default browser.
 */

/* eslint-disable */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Support --projectRoot or GAS_PROJECT_ROOT
const projectRoot = (() => {
  const idx = process.argv.indexOf('--projectRoot');
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return process.env.GAS_PROJECT_ROOT || process.cwd();
})();

const claspConfigPath = path.join(projectRoot, '.clasp.json');
if (!fs.existsSync(claspConfigPath)) {
  console.error('No .clasp.json config found');
  process.exit(1);
}

const deployConfigPath = path.join(projectRoot, '.gas-config.json');
if (!fs.existsSync(deployConfigPath)) {
  console.error('No .gas-config.json found');
  process.exit(1);
}

const claspConfig = JSON.parse(fs.readFileSync(claspConfigPath, 'utf8'));
const deployConfig = JSON.parse(fs.readFileSync(deployConfigPath, 'utf8'));

const type = process.argv[2] || 'project';
let url;
if (type === 'project') {
  url = `https://script.google.com/d/${claspConfig.scriptId}/edit`;
} else if (type === 'dev') {
  url = `https://script.google.com/macros/s/${deployConfig.deployments.headDeployId}/dev`;
} else if (type === 'exec') {
  url = `https://script.google.com/macros/s/${deployConfig.deployments.targetDeployId}/exec`;
} else {
  console.error('Unknown type. Use dev, webapp, or exec');
  process.exit(1);
}

if (process.argv[3] === 'open') {
  // Windows: start, Mac: open, Linux: xdg-open
  const openCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${openCmd} ${url}`);
} else {
  console.log(url);
}
