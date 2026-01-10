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
const fs = require('fs');
const path = require('path');

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

const projectRoot = resolveProjectRoot();
const pushScript = parseArgValue('pushScript');

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
function getDeploymentId() {
    try {
        const configPath = path.join(projectRoot, '.gas-config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        if (config.deployments && config.deployments.targetDeployId) {
            return config.deployments.targetDeployId;
        }

        log('ℹ  targetDeployId not found in .gas-config.json, will create new deployment', 'yellow');
        return null;
    } catch (e) {
        log('ℹ  .gas-config.json not found, will create new deployment', 'yellow');
        return null;
    }
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

        const deploymentId = getDeploymentId();
        if (deploymentId) {
            log(`\nℹ Using deployment ID: ${deploymentId}`, 'blue');
            const deployCmd = `clasp deploy -i ${deploymentId} -d "Auto-deploy ${getTimestamp()}"`;
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

