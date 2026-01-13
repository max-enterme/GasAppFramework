#!/usr/bin/env node

/**
 * Deploy script - Deploy to GAS (does NOT push by default)
 *
 * Options:
 *   --projectRoot <path>      Project root (default: this script's package root)
 *   --pushScript <npm-script> (optional) Run `npm run <npm-script>` before deploy
 *
 * Env:
 *   GAS_PROJECT_ROOT          Same as --projectRoot
 *
 * Notes:
 * - Windows互換のため、シェル依存の `$(date ...)` は使用しない。
 * - 本番/開発など push 手順を分けたいケースがあるため、push は明示指定時のみ実行する。
 */

/* eslint-disable */
const { execSync } = require('child_process');
const path = require('path');

const { getFlagValue, resolveProjectRoot } = require('./lib/cli-args');
const { loadGasConfig } = require('./lib/gas-config');

function getTimestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    yellow: '\x1b[33m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

const argv = process.argv.slice(2);
const projectRoot = resolveProjectRoot(argv, path.resolve(__dirname, '..'));
const pushScript = getFlagValue(argv, 'pushScript');

function exec(command, description) {
    log(`\n▶ ${description}...`, 'blue');
    try {
        execSync(command, { stdio: 'inherit', cwd: projectRoot });
        log(`✓ ${description} completed`, 'green');
        return true;
    } catch (error) {
        log(`✗ ${description} failed`, 'red');
        throw error;
    }
}

// Read deployment ID from .gas-config.json
function readGasConfig() {
    return loadGasConfig(projectRoot);
}

function getDeploymentId(config) {
    const deploymentId = config?.deployments?.targetDeployId;
    if (typeof deploymentId === 'string' && deploymentId.trim()) return deploymentId;
    log('ℹ  targetDeployId not found in .gas-config.json, will create new deployment', 'yellow');
    return null;
}

function getTargetVersionNumber(config) {
    const v = config?.deployments?.targetVersionNumber;
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
    if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v))) {
        const n = Number(v);
        if (n > 0) return n;
    }
    return null;
}

async function main() {
    log('\nℹ Starting deployment process...', 'blue');
    log('='.repeat(60), 'blue');

    try {
        if (pushScript) {
            exec(`npm run ${pushScript}`, `Build and push to Google Apps Script (${pushScript})`);
        } else {
            log('\nℹ Skipping push step (no --pushScript provided).', 'yellow');
            log('  If you need to update code before deploy, run one of:', 'yellow');
            log('    npm run gas:push', 'yellow');
            log('    npm run gas:push:prod', 'yellow');
        }

        const config = readGasConfig();
        const deploymentId = getDeploymentId(config);
        if (deploymentId) {
            log(`\nℹ Using deployment ID: ${deploymentId}`, 'blue');
            const targetVersion = getTargetVersionNumber(config);
            const versionArg = targetVersion ? ` -V ${targetVersion}` : '';
            const deployCmd = `clasp deploy -i ${deploymentId}${versionArg} -d "Auto-deploy ${getTimestamp()}"`;
            exec(deployCmd, 'Deploy to existing deployment');
        } else {
            log('\nℹ Creating new deployment', 'blue');
            const commitHash = execSync('git rev-parse --short HEAD', { cwd: projectRoot }).toString().trim();
            const deployCmd = `clasp deploy -d "Deploy ${commitHash}"`;
            exec(deployCmd, 'Create new deployment');
        }

        log('\n' + '='.repeat(60), 'green');
        log('✓ Deployment completed successfully!', 'green');
        log('='.repeat(60), 'green');

        log('\nℹ Version Information:', 'blue');
        try {
            const commitHash = execSync('git rev-parse HEAD', { cwd: projectRoot }).toString().trim();
            const commitShort = execSync('git rev-parse --short HEAD', { cwd: projectRoot }).toString().trim();
            const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: projectRoot }).toString().trim();
            log(`   Commit: ${commitShort} (${commitHash})`, 'blue');
            log(`   Branch: ${branch}`, 'blue');
        } catch {
            log('   (Git info not available)', 'yellow');
        }
    } catch (error) {
        log('\n' + '='.repeat(60), 'red');
        log('✗ Deployment failed!', 'red');
        log('='.repeat(60), 'red');
        process.exit(1);
    }
}

main();

