#!/usr/bin/env node

/**
 * CLI script to run GAS tests via deployed web app
 *
 * Usage:
 *   npm run gas:test                          # Use HEAD deployment (default)
 *   npm run gas:test -- --target              # Use target deployment
 *   npm run gas:test -- --head                # Use HEAD deployment (explicit)
 *   npm run gas:test -- --category=Repository
 *   npm run gas:test -- --list
 */

/* eslint-disable */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Load configuration
function loadConfig() {
    try {
        const configPath = path.join(__dirname, '../.gas-config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config;
    } catch (e) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ GAS設定未設定エラー');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');
        console.error('.gas-config.json ファイルを作成してください:');
        console.error('');
        console.error('  1. .gas-config.json.example をコピー:');
        console.error('     cp .gas-config.json.example .gas-config.json');
        console.error('');
        console.error('  2. Web Appとしてデプロイ:');
        console.error('     - Apps Scriptエディタを開く');
        console.error('     - 右上の「デプロイ」→「新しいデプロイ」');
        console.error('     - 種類: ウェブアプリ');
        console.error('     - 実行ユーザー: 自分');
        console.error('     - アクセス: 全員');
        console.error('');
        console.error('  3. デプロイIDを.gas-config.jsonに記入:');
        console.error('     {');
        console.error('       "clasprcPath": null,  // または clasp認証ファイルのパス');
        console.error('       "deployments": {');
        console.error('         "headDeployId": "YOUR_HEAD_DEPLOY_ID",');
        console.error('         "targetDeployId": "YOUR_TARGET_DEPLOY_ID"');
        console.error('       }');
        console.error('     }');
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        process.exit(1);
    }
}

// Get authentication token from clasp config
function getAuthToken(config) {
    try {
        const clasprcPath = config.clasprcPath || path.join(os.homedir(), '.clasprc.json');
        const clasprc = JSON.parse(fs.readFileSync(clasprcPath, 'utf8'));
        return clasprc.token;
    } catch (e) {
        console.warn('⚠️  Warning: Could not read clasp authentication token');
        console.warn('   HEAD deployment access may require authentication');
        return null;
    }
}

// Build URL from deployment ID
function buildUrl(deploymentId) {
    return `https://script.google.com/macros/s/${deploymentId}/dev`;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    category: null,
    list: false,
    format: 'json',
    raw: false,
    deployment: 'head' // Default to HEAD deployment (more intuitive for development)
};

args.forEach(arg => {
    if (arg.startsWith('--category=')) {
        options.category = arg.split('=')[1];
    } else if (arg === '--list') {
        options.list = true;
    } else if (arg.startsWith('--format=')) {
        options.format = arg.split('=')[1];
    } else if (arg === '--raw') {
        options.raw = true;
    } else if (arg === '--head') {
        options.deployment = 'head';
    } else if (arg === '--target') {
        options.deployment = 'target';
    }
});

// Load configuration and setup
const config = loadConfig();
const AUTH_TOKEN = getAuthToken(config);

// Determine which deployment to use
const deploymentId = options.deployment === 'target'
    ? config.deployments.targetDeployId
    : config.deployments.headDeployId;

if (!deploymentId) {
    console.error(`❌ Deployment ID not configured for: ${options.deployment}`);
    console.error(`   Please set deployments.${options.deployment}DeployId in .gas-config.json`);
    process.exit(1);
}

const TEST_URL = process.env.GAS_TEST_URL || buildUrl(deploymentId);

// Build URL
let url = TEST_URL;
const params = new URLSearchParams();
if (options.category) params.append('category', options.category);
if (options.list) params.append('list', 'true');
params.append('format', options.format);

if (params.toString()) {
    url += '?' + params.toString();
}

if (!options.raw) {
    console.log(`🚀 Running GAS tests...`);
    console.log(`📍 Deployment: ${options.deployment.toUpperCase()}`);
    console.log(`📍 URL: ${url}`);
    console.log('');
}

// Make request with redirect handling
function makeRequest(requestUrl, redirectCount = 0) {
    if (redirectCount > 5) {
        console.error('❌ Too many redirects');
        process.exit(1);
    }

    const protocol = requestUrl.startsWith('https') ? https : http;
    const urlObj = new URL(requestUrl);

    const requestOptions = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers: {}
    };

    // Add authentication header if available
    if (AUTH_TOKEN && AUTH_TOKEN.access_token) {
        requestOptions.headers['Authorization'] = `Bearer ${AUTH_TOKEN.access_token}`;
    }

    protocol.get(requestOptions, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            if (!options.raw) {
                console.log(`↪️  Following redirect...`);
            }
            return makeRequest(res.headers.location, redirectCount + 1);
        }

        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
        try {
            if (options.format === 'json') {
                const result = JSON.parse(data);

                // If raw mode, just output JSON
                if (options.raw) {
                    console.log(JSON.stringify(result, null, 2));
                    process.exit(result.summary.failed > 0 ? 1 : 0);
                    return;
                }

                // Display results
                console.log('═══════════════════════════════════════════════════════');
                console.log(`📊 Test Results`);
                console.log('═══════════════════════════════════════════════════════');
                console.log('');

                if (result.results) {
                    // Group by category
                    const categories = new Map();
                    result.results.forEach(test => {
                        const cat = test.category || 'Uncategorized';
                        if (!categories.has(cat)) {
                            categories.set(cat, []);
                        }
                        categories.get(cat).push(test);
                    });

                    for (const [category, tests] of categories) {
                        const passed = tests.filter(t => t.ok).length;
                        const total = tests.length;
                        const icon = passed === total ? '✅' : '❌';

                        console.log(`${icon} ${category}: ${passed}/${total} passed`);

                        tests.forEach(test => {
                            const status = test.ok ? '  ✓' : '  ✗';
                            console.log(`${status} ${test.name} (${test.ms}ms)`);
                            if (!test.ok && test.error) {
                                console.log(`    Error: ${test.error}`);
                            }
                        });
                        console.log('');
                    }
                }

                const totalMs = result.results.reduce((sum, t) => sum + (t.ms || 0), 0);
                const summary = result.summary || {};
                console.log('───────────────────────────────────────────────────────');
                console.log(`Total: ${summary.passed}/${summary.total} passed in ${totalMs}ms`);
                console.log(`Executed: ${result.timestamp || new Date().toISOString()}`);
                console.log('═══════════════════════════════════════════════════════');

                // Exit with error code if tests failed
                if (summary.failed > 0) {
                    process.exit(1);
                }
            } else {
                // HTML output
                console.log(data);
            }
        } catch (e) {
            console.error('❌ Error parsing response:', e.message);
            console.error('Response:', data);
            process.exit(1);
        }
    });
    }).on('error', (e) => {
        console.error('❌ Request failed:', e.message);
        process.exit(1);
    });
}

// Start the request
makeRequest(url);
