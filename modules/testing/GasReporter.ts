/**
 * Testing Module - GAS Reporter
 */

import type { TestResult } from './Runner';

/**
 * Print test results in GAS Logger format
 */
export function print(results: TestResult[]): void {
    const ok = results.filter((r) => r.ok).length;
    const ng = results.length - ok;

    // Use Logger if available (GAS environment), otherwise fall back to console
    const logger = typeof Logger !== 'undefined' ? Logger : console;

    logger.log(`[TEST] total=${results.length} ok=${ok} ng=${ng}`);

    // Group results by category for organized output
    const categories = new Map<string, TestResult[]>();
    results.forEach((r) => {
        const cat = r.category || 'General';
        if (!categories.has(cat)) {
            categories.set(cat, []);
        }
        categories.get(cat)!.push(r);
    });

    // Print results by category
    for (const [category, categoryResults] of categories) {
        const catOk = categoryResults.filter((r) => r.ok).length;
        const catNg = categoryResults.length - catOk;

        logger.log(`\n📂 [${category}] ${categoryResults.length} tests (✅${catOk} ❌${catNg})`);

        for (const r of categoryResults) {
            logger.log(
                `  ${r.ok ? '✅' : '❌'} ${r.name} (${r.ms}ms)${r.error ? ' :: ' + r.error : ''}`
            );
        }
    }

    if (ng > 0) throw new Error(`There were ${ng} failing tests`);
}

/**
 * Print test results for a specific category
 */
export function printCategory(results: TestResult[], category: string): void {
    const ok = results.filter((r) => r.ok).length;
    const ng = results.length - ok;

    // Use Logger if available (GAS environment), otherwise fall back to console
    const logger = typeof Logger !== 'undefined' ? Logger : console;

    logger.log(`\n📂 [${category}] total=${results.length} ok=${ok} ng=${ng}`);
    for (const r of results) {
        logger.log(
            `  ${r.ok ? '✅' : '❌'} ${r.name} (${r.ms}ms)${r.error ? ' :: ' + r.error : ''}`
        );
    }
    if (ng > 0) throw new Error(`There were ${ng} failing tests in category ${category}`);
}

/**
 * Format test results as HTML for web display
 */
export function toHtml(results: TestResult[]): string {
    const ok = results.filter((r) => r.ok).length;
    const ng = results.length - ok;

    let html = `<!DOCTYPE html><html><head><style>
        body { font-family: sans-serif; margin: 20px; }
        .summary { padding: 10px; margin-bottom: 20px; border-radius: 5px; }
        .summary.pass { background: #d4edda; color: #155724; }
        .summary.fail { background: #f8d7da; color: #721c24; }
        .category { margin: 20px 0; }
        .test { padding: 8px; margin: 5px 0; border-radius: 3px; }
        .test.pass { background: #d4edda; }
        .test.fail { background: #f8d7da; }
        .error { color: #721c24; margin-top: 5px; font-size: 0.9em; }
    </style></head><body>`;

    html += `<div class="summary ${ng === 0 ? 'pass' : 'fail'}">`;
    html += `<h2>Test Results</h2>`;
    html += `<p>Total: ${results.length} | Passed: ${ok} | Failed: ${ng}</p>`;
    html += `</div>`;

    // Group by category
    const categories = new Map<string, TestResult[]>();
    results.forEach((r) => {
        const cat = r.category || 'General';
        if (!categories.has(cat)) {
            categories.set(cat, []);
        }
        categories.get(cat)!.push(r);
    });

    for (const [category, categoryResults] of categories) {
        const catOk = categoryResults.filter((r) => r.ok).length;

        html += `<div class="category">`;
        html += `<h3>📂 ${category} (${catOk}/${categoryResults.length} passed)</h3>`;

        for (const r of categoryResults) {
            html += `<div class="test ${r.ok ? 'pass' : 'fail'}">`;
            html += `${r.ok ? '✅' : '❌'} ${r.name} <em>(${r.ms}ms)</em>`;
            if (r.error) {
                html += `<div class="error">${r.error}</div>`;
            }
            html += `</div>`;
        }

        html += `</div>`;
    }

    html += `</body></html>`;
    return html;
}
