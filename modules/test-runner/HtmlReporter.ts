/**
 * Test Runner Module - HTML Reporter
 */

import type { TestResult } from '../testing/Runner';
import type { HtmlReporterOptions } from './Types';

const DEFAULT_CSS = `
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 24px;
}

.header {
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 16px;
    margin-bottom: 24px;
}

.header h1 {
    margin: 0 0 8px 0;
    color: #333;
}

.summary {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 24px;
    font-size: 16px;
}

.summary.pass {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
}

.summary.fail {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

.summary-item {
    display: flex;
    flex-direction: column;
}

.summary-item label {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 4px;
}

.summary-item value {
    font-size: 24px;
    font-weight: bold;
}

.category {
    margin-bottom: 24px;
}

.category-header {
    background: #f8f9fa;
    padding: 12px 16px;
    border-radius: 6px 6px 0 0;
    border-left: 4px solid #007bff;
    font-weight: 600;
    color: #333;
}

.category-header .badge {
    float: right;
    background: #007bff;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.test-list {
    border: 1px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 6px 6px;
}

.test {
    padding: 12px 16px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    transition: background 0.2s;
}

.test:last-child {
    border-bottom: none;
}

.test:hover {
    background: #f8f9fa;
}

.test.pass {
    border-left: 3px solid #28a745;
}

.test.fail {
    border-left: 3px solid #dc3545;
    background: #fff5f5;
}

.test-icon {
    font-size: 18px;
    margin-right: 12px;
}

.test-name {
    flex: 1;
    color: #333;
}

.test-time {
    color: #666;
    font-size: 14px;
    margin-left: 12px;
}

.test-time.slow {
    color: #ff9800;
    font-weight: bold;
}

.test-error {
    color: #721c24;
    margin: 8px 0 0 30px;
    padding: 8px;
    background: #f8d7da;
    border-radius: 4px;
    font-size: 14px;
    font-family: 'Courier New', monospace;
}

.footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e0e0e0;
    text-align: center;
    color: #666;
    font-size: 14px;
}

.no-tests {
    text-align: center;
    padding: 48px;
    color: #666;
}

@media print {
    body {
        background: white;
    }
    .container {
        box-shadow: none;
    }
}
`;

/**
 * Generate HTML report from test results
 */
export function generate(
    results: TestResult[],
    options: HtmlReporterOptions = {}
): string {
    const {
        showDetails = true,
        groupByCategory = true,
        includeStyles = true,
        customCss = ''
    } = options;

    const ok = results.filter((r) => r.ok).length;
    const ng = results.length - ok;
    const totalMs = results.reduce((sum, r) => sum + r.ms, 0);

    let html = '<!DOCTYPE html><html lang="ja"><head>';
    html += '<meta charset="UTF-8">';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    html += '<title>Test Results</title>';

    if (includeStyles) {
        html += `<style>${DEFAULT_CSS}${customCss}</style>`;
    }

    html += '</head><body>';
    html += '<div class="container">';

    // Header
    html += '<div class="header">';
    html += '<h1>🧪 Test Results</h1>';
    html += `<p>Executed: ${new Date().toLocaleString('ja-JP')}</p>`;
    html += '</div>';

    // Summary
    const summaryClass = ng === 0 ? 'pass' : 'fail';
    html += `<div class="summary ${summaryClass}">`;
    html += '<div class="summary-item">';
    html += '<label>Total</label>';
    html += `<value>${results.length}</value>`;
    html += '</div>';
    html += '<div class="summary-item">';
    html += '<label>✅ Passed</label>';
    html += `<value>${ok}</value>`;
    html += '</div>';
    html += '<div class="summary-item">';
    html += '<label>❌ Failed</label>';
    html += `<value>${ng}</value>`;
    html += '</div>';
    html += '<div class="summary-item">';
    html += '<label>⏱️ Total Time</label>';
    html += `<value>${totalMs}ms</value>`;
    html += '</div>';
    html += '</div>';

    if (results.length === 0) {
        html += '<div class="no-tests">No tests found</div>';
    } else if (showDetails) {
        if (groupByCategory) {
            html += generateCategoryView(results);
        } else {
            html += generateFlatView(results);
        }
    }

    // Footer
    html += '<div class="footer">';
    html += 'Powered by GAS App Framework Test Runner';
    html += '</div>';

    html += '</div></body></html>';
    return html;
}

/**
 * Generate category-grouped view
 */
function generateCategoryView(results: TestResult[]): string {
    const categories = new Map<string, TestResult[]>();

    results.forEach((r) => {
        const cat = r.category || 'Uncategorized';
        if (!categories.has(cat)) {
            categories.set(cat, []);
        }
        categories.get(cat)!.push(r);
    });

    let html = '';

    for (const [category, tests] of categories) {
        const catOk = tests.filter((r) => r.ok).length;
        const catTotal = tests.length;

        html += '<div class="category">';
        html += '<div class="category-header">';
        html += `📂 ${category}`;
        html += `<span class="badge">${catOk}/${catTotal}</span>`;
        html += '</div>';
        html += '<div class="test-list">';

        for (const test of tests) {
            html += formatTestItem(test);
        }

        html += '</div>';
        html += '</div>';
    }

    return html;
}

/**
 * Generate flat list view
 */
function generateFlatView(results: TestResult[]): string {
    let html = '<div class="test-list">';

    for (const test of results) {
        html += formatTestItem(test);
    }

    html += '</div>';
    return html;
}

/**
 * Format individual test item
 */
function formatTestItem(test: TestResult): string {
    const status = test.ok ? 'pass' : 'fail';
    const icon = test.ok ? '✅' : '❌';
    const timeClass = test.ms > 1000 ? 'slow' : '';

    let html = `<div class="test ${status}">`;
    html += `<span class="test-icon">${icon}</span>`;
    html += `<span class="test-name">${escapeHtml(test.name)}</span>`;
    html += `<span class="test-time ${timeClass}">${test.ms}ms</span>`;
    html += '</div>';

    if (test.error) {
        html += `<div class="test-error">${escapeHtml(test.error)}</div>`;
    }

    return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Generate JSON report
 */
export function toJson(results: TestResult[]): string {
    const ok = results.filter((r) => r.ok).length;
    const ng = results.length - ok;

    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total: results.length,
            passed: ok,
            failed: ng
        },
        results: results.map((r) => ({
            name: r.name,
            category: r.category || 'Uncategorized',
            ok: r.ok,
            ms: r.ms,
            error: r.error || null
        }))
    };

    return JSON.stringify(report, null, 2);
}
