/**
 * Testing Module - Test Runner
 */

import * as Test from './Test';
import { LogEntry, getGlobalLogCapture } from './LogCapture';

/**
 * Custom output generator function
 * Called after all tests complete to generate additional output
 */
export type CustomOutputGenerator = (results: TestResult[]) => CustomOutput | null;

export interface CustomOutput {
    title: string;
    content: string;
    type?: 'text' | 'html' | 'json';
}

export interface TestResult {
    name: string;
    ok: boolean;
    error?: string;
    ms: number;
    category: string;
    logs?: LogEntry[];
    metadata?: Record<string, any>;
}

export interface TestRunContext {
    customOutputGenerator?: CustomOutputGenerator;
}

// Global test run context
let globalTestRunContext: TestRunContext = {};

/**
 * Set custom output generator
 */
export function setCustomOutputGenerator(generator: CustomOutputGenerator | undefined): void {
    globalTestRunContext.customOutputGenerator = generator;
}

/**
 * Get custom output generator
 */
export function getCustomOutputGenerator(): CustomOutputGenerator | undefined {
    return globalTestRunContext.customOutputGenerator;
}

/**
 * Run all registered test cases
 */
export function runAll(): TestResult[] {
    const results: TestResult[] = [];
    const logCapture = getGlobalLogCapture();

    for (const c of Test.all()) {
        const t0 = Date.now();
        const testCase = Test.getCaseWithCategory(c);

        // Start capturing logs for this test
        logCapture.clear();
        logCapture.start();

        try {
            c.fn();
            const logs = logCapture.getLogs();
            logCapture.stop();

            results.push({
                name: c.name,
                ok: true,
                ms: Date.now() - t0,
                category: testCase.category,
                logs: logs.length > 0 ? logs : undefined
            });
        } catch (e: any) {
            const logs = logCapture.getLogs();
            logCapture.stop();

            results.push({
                name: c.name,
                ok: false,
                error: String(e?.message ?? e),
                ms: Date.now() - t0,
                category: testCase.category,
                logs: logs.length > 0 ? logs : undefined
            });
        }
    }
    return results;
}

/**
 * Run test cases by category
 */
export function runByCategory(category: string): TestResult[] {
    const results: TestResult[] = [];
    const logCapture = getGlobalLogCapture();

    for (const c of Test.byCategory(category)) {
        const t0 = Date.now();
        const testCase = Test.getCaseWithCategory(c);

        // Start capturing logs for this test
        logCapture.clear();
        logCapture.start();

        try {
            c.fn();
            const logs = logCapture.getLogs();
            logCapture.stop();

            results.push({
                name: c.name,
                ok: true,
                ms: Date.now() - t0,
                category: testCase.category,
                logs: logs.length > 0 ? logs : undefined
            });
        } catch (e: any) {
            const logs = logCapture.getLogs();
            logCapture.stop();

            results.push({
                name: c.name,
                ok: false,
                error: String(e?.message ?? e),
                ms: Date.now() - t0,
                category: testCase.category,
                logs: logs.length > 0 ? logs : undefined
            });
        }
    }
    return results;
}

/**
 * Get summary of test results
 */
export function summarize(results: TestResult[]): {
    total: number;
    passed: number;
    failed: number;
    duration: number;
} {
    return {
        total: results.length,
        passed: results.filter((r) => r.ok).length,
        failed: results.filter((r) => !r.ok).length,
        duration: results.reduce((sum, r) => sum + r.ms, 0)
    };
}
