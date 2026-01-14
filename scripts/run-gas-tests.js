#!/usr/bin/env node

/**
 * CLI script to run GAS tests via deployed web app.
 *
 * Options:
 *   --projectRoot <path>   Resolve .gas-config.json from this directory (default: this script's package root)
 *   --category=<name>      Run tests in a category
 *   --list                 List categories
 *   --format=json|html     Output format (default: json)
 *   --param <k=v>          Append a query parameter (repeatable)
 *   --param=<k=v>          Same as above
 *   --params <querystring> Append querystring (e.g. "a=1&b=2")
 *   --params=<querystring> Same as above
 *   --raw                  Print raw JSON and exit
 *
 * Env:
 *   GAS_PROJECT_ROOT       Same as --projectRoot
 *   GAS_TEST_URL           Override full URL (exec). Parameters are appended.
 */

/* eslint-disable */

const https = require('https');
const http = require('http');
const path = require('path');

const { getFlagValue, getRepeatableFlagValues, resolveProjectRoot } = require('./lib/cli-args');
const { resolveExecUrl } = require('./lib/gas-config');
const { mergeParams, parseParams, parseParamPairs } = require('./lib/params');

const argv = process.argv.slice(2);
const projectRoot = resolveProjectRoot(argv, path.resolve(__dirname, '..'));

const options = {
    category: getFlagValue(argv, 'category'),
    list: argv.includes('--list'),
    format: getFlagValue(argv, 'format') || 'json',
    raw: argv.includes('--raw'),
};

let baseUrl;
try {
    // Prefer GAS_TEST_URL when set; otherwise .gas-config.json (proxy.* preferred)
    baseUrl = resolveExecUrl({ projectRoot, envVar: 'GAS_TEST_URL' });
} catch (e) {
    console.error(e?.message || String(e));
    process.exit(1);
}

const paramPairs = getRepeatableFlagValues(argv, 'param');
const paramsRaw = getFlagValue(argv, 'params');

let extraParams = {};
try {
    extraParams =
        mergeParams(
            paramsRaw ? parseParams(paramsRaw) : undefined,
            paramPairs.length ? parseParamPairs(paramPairs) : undefined
        ) || {};
} catch (e) {
    console.error(e?.message || String(e));
    process.exit(1);
}

let url = baseUrl;
const params = new URLSearchParams();
if (options.category) params.append('category', options.category);
if (options.list) params.append('list', 'true');
params.append('format', options.format);

for (const [k, v] of Object.entries(extraParams)) {
    if (v === undefined) continue;
    if (v === null) {
        params.append(k, '');
        continue;
    }
    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') {
        params.append(k, String(v));
        continue;
    }
    params.append(k, JSON.stringify(v));
}

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
        headers: {},
    };

    protocol
        .get(requestOptions, (res) => {
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
                            result.results.forEach((test) => {
                                const cat = test.category || 'Uncategorized';
                                if (!categories.has(cat)) {
                                    categories.set(cat, []);
                                }
                                categories.get(cat).push(test);
                            });

                            for (const [category, tests] of categories) {
                                const passed = tests.filter((t) => t.ok).length;
                                const total = tests.length;
                                const icon = passed === total ? '[PASS]' : '[FAIL]';

                                console.log(`${icon} ${category}: ${passed}/${total} passed`);

                                tests.forEach((test) => {
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
                        return;
                    }

                    console.log(data);
                    process.exit(0);
                } catch (e) {
                    console.error('[ERROR] Error parsing response:', e.message);
                    console.error('Response:', data);
                    process.exit(1);
                }
            });
        })
        .on('error', (e) => {
            console.error('[ERROR] Request failed:', e.message);
            process.exit(1);
        });
}

makeRequest(url);
