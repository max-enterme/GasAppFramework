/**
 * Test Runner Module - Web Test Runner
 *
 * Provides a web-based test runner accessible via doGet() in Google Apps Script
 */

import { runAll, runByCategory } from '../testing/Runner';
import { all } from '../testing/Test';
import type { TestRunnerConfig, TestRequest } from './Types';
import * as HtmlReporter from './HtmlReporter';

/**
 * Main Web Test Runner
 */
export class WebTestRunner {
    constructor(private config: TestRunnerConfig = {}) {}

    /**
     * Handle doGet request for test execution
     */
    handleRequest(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
        const request = this.parseRequest(e);

        if (request.list) {
            return this.renderTestList();
        }

        if (request.category) {
            return this.runCategoryTests(request.category, request.format);
        }

        if (request.all !== false) {
            // Default: run all tests
            return this.runAllTests(request.format);
        }

        return this.renderIndexPage();
    }

    /**
     * Parse URL parameters into TestRequest
     */
    private parseRequest(e: GoogleAppsScript.Events.DoGet): TestRequest {
        const params = e.parameter || {};
        return {
            all: params.all !== undefined ? params.all === 'true' : true,
            category: params.category,
            list: params.list === 'true',
            format: (params.format as 'html' | 'json') || 'html'
        };
    }

    /**
     * Run all tests and return HTML or JSON output
     */
    private runAllTests(format: 'html' | 'json' = 'html'): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
        const results = runAll();

        if (format === 'json') {
            const json = HtmlReporter.toJson(results);
            return ContentService.createTextOutput(json)
                .setMimeType(ContentService.MimeType.JSON);
        }

        const html = HtmlReporter.generate(results, {
            showDetails: true,
            groupByCategory: true
        });

        return HtmlService.createHtmlOutput(html)
            .setTitle(this.config.title || 'Test Results')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    /**
     * Run tests for specific category
     */
    private runCategoryTests(
        category: string,
        format: 'html' | 'json' = 'html'
    ): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
        const results = runByCategory(category);

        if (format === 'json') {
            const json = HtmlReporter.toJson(results);
            return ContentService.createTextOutput(json)
                .setMimeType(ContentService.MimeType.JSON);
        }

        const html = HtmlReporter.generate(results, {
            showDetails: true,
            groupByCategory: false
        });

        return HtmlService.createHtmlOutput(html)
            .setTitle(`${category} - Test Results`)
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    /**
     * Render test category list
     */
    private renderTestList(): GoogleAppsScript.HTML.HtmlOutput {
        const tests = all();
        const categories = new Map<string, number>();

        tests.forEach((t) => {
            const cat = t.category || 'Uncategorized';
            categories.set(cat, (categories.get(cat) || 0) + 1);
        });

        let html = '<!DOCTYPE html><html><head>';
        html += '<meta charset="UTF-8">';
        html += '<title>Available Tests</title>';
        html += '<style>';
        html += 'body { font-family: sans-serif; margin: 20px; }';
        html += 'h1 { color: #333; }';
        html += 'ul { list-style: none; padding: 0; }';
        html += 'li { padding: 8px; margin: 4px 0; background: #f0f0f0; border-radius: 4px; }';
        html += 'a { color: #007bff; text-decoration: none; }';
        html += 'a:hover { text-decoration: underline; }';
        html += '.badge { background: #007bff; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px; }';
        html += '</style>';
        html += '</head><body>';
        html += '<h1>📋 Available Test Categories</h1>';
        html += `<p>Total: ${tests.length} tests in ${categories.size} categories</p>`;
        html += '<ul>';

        for (const [cat, count] of categories) {
            const url = this.buildUrl({ category: cat });
            html += '<li>';
            html += `<a href="${url}">📂 ${cat}</a>`;
            html += `<span class="badge">${count}</span>`;
            html += '</li>';
        }

        html += '</ul>';
        html += '<hr>';
        html += `<p><a href="${this.buildUrl({ all: 'true' })}">▶️ Run All Tests</a></p>`;
        html += '</body></html>';

        return HtmlService.createHtmlOutput(html)
            .setTitle('Available Tests')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    /**
     * Render index/help page
     */
    private renderIndexPage(): GoogleAppsScript.HTML.HtmlOutput {
        const tests = all();
        const categories = new Set<string>();
        tests.forEach((t) => categories.add(t.category || 'Uncategorized'));

        let html = '<!DOCTYPE html><html><head>';
        html += '<meta charset="UTF-8">';
        html += '<title>Test Runner</title>';
        html += '<style>';
        html += 'body { font-family: sans-serif; margin: 40px; max-width: 800px; }';
        html += 'h1 { color: #333; }';
        html += '.btn { display: inline-block; padding: 12px 24px; margin: 8px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; }';
        html += '.btn:hover { background: #0056b3; }';
        html += 'code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }';
        html += 'pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow-x: auto; }';
        html += '</style>';
        html += '</head><body>';
        html += '<h1>🧪 GAS App Framework Test Runner</h1>';
        html += `<p>Found ${tests.length} tests in ${categories.size} categories</p>`;

        html += '<h2>Quick Actions</h2>';
        html += `<a href="${this.buildUrl({ all: 'true' })}" class="btn">▶️ Run All Tests</a>`;
        html += `<a href="${this.buildUrl({ list: 'true' })}" class="btn">📋 List Categories</a>`;

        html += '<h2>URL Parameters</h2>';
        html += '<ul>';
        html += '<li><code>?all=true</code> - Run all tests (default)</li>';
        html += '<li><code>?category=CategoryName</code> - Run specific category</li>';
        html += '<li><code>?list=true</code> - List all categories</li>';
        html += '<li><code>?format=json</code> - Output as JSON</li>';
        html += '</ul>';

        html += '<h2>Examples</h2>';
        html += '<pre>';
        html += `${this.buildUrl({ all: 'true' })}\n`;
        html += `${this.buildUrl({ category: 'Repository' })}\n`;
        html += `${this.buildUrl({ list: 'true' })}\n`;
        html += `${this.buildUrl({ all: 'true', format: 'json' })}`;
        html += '</pre>';

        html += '</body></html>';

        return HtmlService.createHtmlOutput(html)
            .setTitle('Test Runner')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    /**
     * Build URL with parameters
     */
    private buildUrl(params: Record<string, string>): string {
        const base = this.config.baseUrl || ScriptApp.getService().getUrl();
        const query = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&');
        return `${base}?${query}`;
    }
}

/**
 * Create a simple doGet handler
 */
export function createDoGetHandler(config?: TestRunnerConfig) {
    const runner = new WebTestRunner(config);
    return (e: GoogleAppsScript.Events.DoGet) => runner.handleRequest(e);
}
