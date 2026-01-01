#!/usr/bin/env node

/**
 * CLI script to run GAS tests via deployed web app (target deployment only)
 *
 * Options:
 *   --projectRoot <path>   Resolve .gas-config.json from this directory (default: this script's package root)
 *   --category=<name>      Run tests in a category
 *   --list                 List categories
 *   --format=json|html     Output format (default: json)
 *   --raw                  Print raw JSON and exit
 *
 * Env:
 *   GAS_PROJECT_ROOT       Same as --projectRoot
 *   GAS_TEST_URL           Override full URL (exec). Parameters are appended.
 */

/* eslint-disable */
const https = require('https');
const http = require('http');
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

function loadConfig(projectRoot) {
    try {
        const configPath = path.resolve(projectRoot, '.gas-config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config;
    } catch (e) {
        console.error('========================================================');
        console.error('[ERROR] GAS設定未設定エラー');
        console.error('========================================================');
        console.error('');
        console.error('.gas-config.json ファイルを作成してください:');
        console.error('');
        console.error('  1. .gas-config.example.json をコピー:');
        console.error('     cp .gas-config.example.json .gas-config.json');
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
        console.error('       "deployments": {');
        console.error('         "targetDeployId": "YOUR_TARGET_DEPLOY_ID"');
        console.error('       }');
        console.error('     }');
        console.error('');
        console.error(`(探索パス: ${path.resolve(projectRoot, '.gas-config.json')})`);
        console.error('========================================================');
        process.exit(1);
    }
}

function buildExecUrl(deploymentId) {
    return `https://script.google.com/macros/s/${deploymentId}/exec`;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    category: null,
    list: false,
    format: 'json',
    raw: false
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
    }
});

const projectRoot = resolveProjectRoot();
const config = loadConfig(projectRoot);

const deploymentId = config?.deployments?.targetDeployId;
if (!deploymentId) {
    console.error('[ERROR] Deployment ID not configured');
    console.error('   Please set deployments.targetDeployId in .gas-config.json');
    process.exit(1);
}

const baseUrl = process.env.GAS_TEST_URL || buildExecUrl(deploymentId);

// Build URL with params
let url = baseUrl;
const params = new URLSearchParams();
if (options.category) params.append('category', options.category);
if (options.list) params.append('list', 'true');
params.append('format', options.format);
if (params.toString()) url += '?' + params.toString();

if (!options.raw) {
    console.log('[*] Running GAS tests...');
    console.log(`[*] URL: ${url}`);
    console.log('');
}

function makeRequest(requestUrl, redirectCount = 0) {
    if (redirectCount > 5) {
        console.error('[ERROR] Too many redirects');
        process.exit(1);
    }

    const protocol = requestUrl.startsWith('https') ? https : http;
    const urlObj = new URL(requestUrl);

    const requestOptions = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers: {}
    };

    protocol.get(requestOptions, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            if (!options.raw) {
                console.log('[->] Following redirect...');
            }
            const nextUrl = res.headers.location.startsWith('http')
                ? res.headers.location
                : `${urlObj.protocol}//${urlObj.host}${res.headers.location}`;
            return makeRequest(nextUrl, redirectCount + 1);
        }

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                if (options.format === 'json') {
                    const result = JSON.parse(data);

                    if (options.raw) {
                        console.log(JSON.stringify(result, null, 2));
                        process.exit(result?.summary?.failed > 0 ? 1 : 0);
                        return;
                    }

                    console.log('========================================================');
                    console.log('** Test Results');
                    console.log('========================================================');
                    console.log('');

                    if (result.results) {
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
                            const icon = passed === total ? '[PASS]' : '[FAIL]';

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

                    const totalMs = (result.results || []).reduce((sum, t) => sum + (t.ms || 0), 0);
                    const summary = result.summary || {};
                    console.log('--------------------------------------------------------');
                    console.log(`Total: ${summary.passed}/${summary.total} passed in ${totalMs}ms`);
                    console.log(`Executed: ${result.timestamp || new Date().toISOString()}`);

                    if (result.customOutput) {
                        console.log('');
                        console.log('--------------------------------------------------------');
                        console.log(result.customOutput.title);
                        console.log('--------------------------------------------------------');
                        console.log(result.customOutput.content);
                    }

                    console.log('========================================================');

                    process.exit(summary.failed > 0 ? 1 : 0);
                } else {
                    console.log(data);
                    process.exit(0);
                }
            } catch (e) {
                console.error('[ERROR] Error parsing response:', e.message);
                console.error('Response:', data);
                process.exit(1);
            }
        });
    }).on('error', (e) => {
        console.error('[ERROR] Request failed:', e.message);
        process.exit(1);
    });
}

makeRequest(url);

