#!/usr/bin/env node

/**
 * Inject version information (git commit hash) into the build
 *
 * Options:
 *   --projectRoot <path>   Project root to resolve git + bundle paths (default: this script's package root)
 *   --input <path>         Bundle path relative to projectRoot (default: build/0_main.js)
 *
 * Env:
 *   GAS_PROJECT_ROOT       Same as --projectRoot
 */

/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgValue(name) {
    const prefix = `--${name}=`;
    const index = process.argv.findIndex((arg) => arg === `--${name}` || arg.startsWith(prefix));
    if (index < 0) return null;
    const arg = process.argv[index];
    if (arg.startsWith(prefix)) return arg.slice(prefix.length);
    const next = process.argv[index + 1];
    if (!next || next.startsWith('--')) return null;
    return next;
}

function resolveProjectRoot() {
    const defaultRoot = path.resolve(__dirname, '..');
    const argRoot = parseArgValue('projectRoot');
    const envRoot = process.env.GAS_PROJECT_ROOT;
    return path.resolve(argRoot || envRoot || defaultRoot);
}

function resolveInputPath(projectRoot) {
    const input = parseArgValue('input');
    return path.resolve(projectRoot, input || 'build/0_main.js');
}

const projectRoot = resolveProjectRoot();
const mainJsPath = resolveInputPath(projectRoot);

// Get git commit hash
let commitHash = 'unknown';
let commitDate = 'unknown';
let branch = 'unknown';

try {
    commitHash = execSync('git rev-parse HEAD', { cwd: projectRoot }).toString().trim();
    const gitCommitDate = execSync('git log -1 --format=%cd --date=iso', { cwd: projectRoot }).toString().trim();
    commitDate = new Date(gitCommitDate).toISOString();
    branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: projectRoot }).toString().trim();
    console.log('? Git info retrieved:');
    console.log('   Commit: ' + commitHash.substring(0, 8));
    console.log('   Branch: ' + branch);
    console.log('   Date: ' + commitDate);
} catch (e) {
    console.warn('??  Could not retrieve git information:', e.message);
}

// Read the bundled file
let content = fs.readFileSync(mainJsPath, 'utf-8');

// Inject version info at the beginning after the webpack bootstrap
const versionInfo = `
// ============================================================
// VERSION INFORMATION (Auto-injected by build script)
// ============================================================
if (typeof globalThis !== 'undefined') {
    globalThis.__GAS_APP_VERSION__ = {
        commitHash: '${commitHash}',
        commitShort: '${commitHash.substring(0, 8)}',
        commitDate: '${commitDate}',
        branch: '${branch}',
        buildDate: '${new Date().toISOString()}'
    };
}
// ============================================================

`;

// Find a good injection point - try multiple patterns
let insertPoint = content.indexOf('var __webpack_exports__ = {};');

// If webpack_exports pattern not found, try minified patterns
if (insertPoint < 0) {
    // Pattern for minified webpack output
    insertPoint = content.indexOf('"use strict";');
    if (insertPoint > 0) {
        // Insert after "use strict"; line
        insertPoint = content.indexOf(';', insertPoint) + 1;
    }
}

// Fallback: insert at the very beginning
if (insertPoint < 0) {
    insertPoint = 0;
}

if (insertPoint >= 0) {
    content = content.substring(0, insertPoint) + versionInfo + content.substring(insertPoint);
    fs.writeFileSync(mainJsPath, content, 'utf-8');
    console.log(`? Version info injected into ${path.relative(projectRoot, mainJsPath)}`);
} else {
    console.error(`? Could not find injection point in ${path.relative(projectRoot, mainJsPath)}`);
    process.exit(1);
}

