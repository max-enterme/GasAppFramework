#!/usr/bin/env node

/**
 * Inject version information (git commit hash) into the build
 */

/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get git commit hash
let commitHash = 'unknown';
let commitDate = 'unknown';
let branch = 'unknown';

try {
    commitHash = execSync('git rev-parse HEAD').toString().trim();
    const gitCommitDate = execSync('git log -1 --format=%cd --date=iso').toString().trim();
    commitDate = new Date(gitCommitDate).toISOString();
    branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    console.log('✅ Git info retrieved:');
    console.log('   Commit: ' + commitHash.substring(0, 8));
    console.log('   Branch: ' + branch);
    console.log('   Date: ' + commitDate);
} catch (e) {
    console.warn('⚠️  Could not retrieve git information:', e.message);
}

// Read the bundled file
const mainJsPath = path.join(__dirname, '../build/0_main.js');
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
    console.log('✅ Version info injected into build/0_main.js');
} else {
    console.error('❌ Could not find injection point in build/0_main.js');
    process.exit(1);
}
