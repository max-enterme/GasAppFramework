#!/usr/bin/env node

/**
 * Deploy script - Build, inject version, push, and deploy to GAS
 * 
 * Usage:
 *   node scripts/deploy.js
 *   npm run deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function exec(command, description) {
    log(`\n▶ ${description}...`, 'blue');
    try {
        execSync(command, { stdio: 'inherit' });
        log(`✅ ${description} completed`, 'green');
        return true;
    } catch (error) {
        log(`❌ ${description} failed`, 'red');
        throw error;
    }
}

// Read deployment ID from .gas-config.json
function getDeploymentId() {
    try {
        const configPath = path.join(__dirname, '../.gas-config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Extract deployment ID from URL
        const url = config.deploymentUrl;
        const match = url.match(/\/s\/([^\/]+)\//);
        if (match) {
            return match[1];
        }
        
        log('⚠️  Could not extract deployment ID from URL, will create new deployment', 'yellow');
        return null;
    } catch (e) {
        log('⚠️  .gas-config.json not found, will create new deployment', 'yellow');
        return null;
    }
}

async function main() {
    log('\n🚀 Starting deployment process...', 'blue');
    log('='.repeat(60), 'blue');
    
    try {
        // Step 1: Build
        exec('npm run build', 'Build project');
        
        // Step 2: Inject version
        exec('node scripts/inject-version.js', 'Inject version information');
        
        // Step 3: Push to GAS
        exec('clasp push', 'Push files to Google Apps Script');
        
        // Step 4: Deploy
        const deploymentId = getDeploymentId();
        if (deploymentId) {
            log(`\n📌 Using deployment ID: ${deploymentId}`, 'blue');
            const deployCmd = `clasp deploy -i ${deploymentId} -d "Auto-deploy $(date +%Y-%m-%d_%H:%M:%S)"`;
            exec(deployCmd, 'Deploy to existing deployment');
        } else {
            log('\n📌 Creating new deployment', 'blue');
            const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
            const deployCmd = `clasp deploy -d "Deploy ${commitHash}"`;
            exec(deployCmd, 'Create new deployment');
        }
        
        log('\n' + '='.repeat(60), 'green');
        log('✅ Deployment completed successfully!', 'green');
        log('='.repeat(60), 'green');
        
        // Show version info
        log('\n📋 Version Information:', 'blue');
        try {
            const commitHash = execSync('git rev-parse HEAD').toString().trim();
            const commitShort = execSync('git rev-parse --short HEAD').toString().trim();
            const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
            log(`   Commit: ${commitShort} (${commitHash})`, 'blue');
            log(`   Branch: ${branch}`, 'blue');
        } catch (e) {
            log('   (Git info not available)', 'yellow');
        }
        
    } catch (error) {
        log('\n' + '='.repeat(60), 'red');
        log('❌ Deployment failed!', 'red');
        log('='.repeat(60), 'red');
        process.exit(1);
    }
}

main();
