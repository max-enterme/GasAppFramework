#!/usr/bin/env node

/**
 * CLI script to run GAS tests via deployed web app
 *
 * Usage:
 *   npm run gas:test
 *   npm run gas:test -- --category=Repository
 *   npm run gas:test -- --list
 */

/* eslint-disable */
const https = require('https');
const http = require('http');

// Get deployment URL from environment or config
const DEPLOYMENT_URL = process.env.GAS_DEPLOYMENT_URL || getDeploymentUrl();

function getDeploymentUrl() {
    try {
        const fs = require('fs');
        const config = JSON.parse(fs.readFileSync('.gas-config.json', 'utf8'));
        return config.deploymentUrl;
    } catch (e) {
        console.error('❌ Error: GAS_DEPLOYMENT_URL not set and .gas-config.json not found');
        console.error('');
        console.error('Please either:');
        console.error('  1. Set GAS_DEPLOYMENT_URL environment variable');
        console.error('  2. Create .gas-config.json with {"deploymentUrl": "your-url"}');
        console.error('');
        console.error('To get your deployment URL:');
        console.error('  1. Run: npm run gas:deploy');
        console.error('  2. Copy the Web app URL from the output');
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    category: null,
    list: false,
    format: 'json'
};

args.forEach(arg => {
    if (arg.startsWith('--category=')) {
        options.category = arg.split('=')[1];
    } else if (arg === '--list') {
        options.list = true;
    } else if (arg.startsWith('--format=')) {
        options.format = arg.split('=')[1];
    }
});

// Build URL
let url = DEPLOYMENT_URL;
const params = new URLSearchParams();
if (options.category) params.append('category', options.category);
if (options.list) params.append('list', 'true');
params.append('format', options.format);

if (params.toString()) {
    url += '?' + params.toString();
}

console.log(`🚀 Running GAS tests...`);
console.log(`📍 URL: ${url}`);
console.log('');

// Make request with redirect handling
function makeRequest(requestUrl, redirectCount = 0) {
    if (redirectCount > 5) {
        console.error('❌ Too many redirects');
        process.exit(1);
    }

    const protocol = requestUrl.startsWith('https') ? https : http;

    protocol.get(requestUrl, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            console.log(`↪️  Following redirect...`);
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
