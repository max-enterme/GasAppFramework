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
const { resolveProjectRoot } = require('./lib/cli-args');
const { openInBrowser } = require('./lib/open-in-browser');
const { buildWebAppDevUrl, resolveExecUrlFromGasConfig, loadGasConfig } = require('./lib/gas-config');

// Support --projectRoot or GAS_PROJECT_ROOT
const projectRoot = resolveProjectRoot(process.argv.slice(2));

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
const deployConfig = loadGasConfig(projectRoot);

const type = process.argv[2] || 'project';
let url;
if (type === 'project') {
  url = `https://script.google.com/d/${claspConfig.scriptId}/edit`;
} else if (type === 'dev') {
  if (!deployConfig?.deployments?.headDeployId) {
    console.error('deployments.headDeployId not found in .gas-config.json');
    process.exit(1);
  }
  url = buildWebAppDevUrl(deployConfig.deployments.headDeployId);
} else if (type === 'exec') {
  url = resolveExecUrlFromGasConfig(deployConfig);
  if (!url) {
    console.error('proxy.execUrl / proxy.targetDeployId / deployments.targetDeployId not found in .gas-config.json');
    process.exit(1);
  }
} else {
  console.error('Unknown type. Use dev, webapp, or exec');
  process.exit(1);
}

if (process.argv[3] === 'open') {
  const child = openInBrowser(url);
  child.unref();
} else {
  console.log(url);
}
