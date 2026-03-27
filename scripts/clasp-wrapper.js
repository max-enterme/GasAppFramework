#!/usr/bin/env node

/**
 * clasp-wrapper.js - GAS_ENV-aware wrapper for @google/clasp
 *
 * Usage:
 *   node clasp-wrapper.js <clasp-command> [clasp-args...]
 *
 * Env:
 *   GAS_ENV   Environment name (default: "dev")
 *             Selects .clasp.{GAS_ENV}.json and .gas-config.{GAS_ENV}.json
 *
 * Behaviour:
 *   1. Copy .clasp.{env}.json  -> .clasp.json
 *   2. Copy .gas-config.{env}.json -> .gas-config.json  (if source exists)
 *   3. Run: clasp <command> [args...]
 *   4. Remove the generated .clasp.json / .gas-config.json
 */

/* eslint-disable */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { resolveProjectRoot } = require('./lib/cli-args');

const argv = process.argv.slice(2);
const projectRoot = resolveProjectRoot(argv, path.resolve(__dirname, '..'));

const env = process.env.GAS_ENV || 'dev';
const claspCommand = argv.filter((a) => !a.startsWith('--projectRoot')).join(' ');

if (!claspCommand) {
  console.error('Usage: clasp-wrapper.js <clasp-command> [args...]');
  process.exit(1);
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};
function log(msg, color = 'reset') {
  console.log(colors[color] + msg + colors.reset);
}

// Pairs: [source (env-specific), destination (clasp expects)]
const filePairs = [
  [`.clasp.${env}.json`, '.clasp.json'],
  [`.gas-config.${env}.json`, '.gas-config.json'],
];

const generated = [];

function setup() {
  for (const [src, dest] of filePairs) {
    const srcPath = path.join(projectRoot, src);
    const destPath = path.join(projectRoot, dest);

    if (!fs.existsSync(srcPath)) {
      if (dest === '.clasp.json') {
        console.error(`Error: ${src} not found in ${projectRoot}`);
        process.exit(1);
      }
      // .gas-config is optional
      continue;
    }

    if (fs.existsSync(destPath)) {
      log(`Warning: ${dest} already exists, skipping copy from ${src}`, 'yellow');
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
    generated.push(destPath);
    log(`[clasp-wrapper] ${src} -> ${dest}  (env=${env})`, 'blue');
  }
}

function cleanup() {
  for (const filePath of generated) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // ignore
    }
  }
}

// Main
setup();
try {
  log(`[clasp-wrapper] clasp ${claspCommand}`, 'blue');
  execSync(`npx clasp ${claspCommand}`, { stdio: 'inherit', cwd: projectRoot });
} catch (error) {
  cleanup();
  process.exit(error.status || 1);
}
cleanup();
