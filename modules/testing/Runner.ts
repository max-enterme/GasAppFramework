/**
 * Testing Module - Test Runner
 */

import * as Test from './Test';

export interface TestResult {
    name: string;
    ok: boolean;
    error?: string;
    ms: number;
    category: string;
}

/**
 * Run all registered test cases
 */
export function runAll(): TestResult[] {
    const results: TestResult[] = [];
    for (const c of Test.all()) {
        const t0 = Date.now();
        const testCase = Test.getCaseWithCategory(c);
        try {
            c.fn();
            results.push({
                name: c.name,
                ok: true,
                ms: Date.now() - t0,
                category: testCase.category
            });
        } catch (e: any) {
            results.push({
                name: c.name,
                ok: false,
                error: String(e?.message ?? e),
                ms: Date.now() - t0,
                category: testCase.category
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
    for (const c of Test.byCategory(category)) {
        const t0 = Date.now();
        const testCase = Test.getCaseWithCategory(c);
        try {
            c.fn();
            results.push({
                name: c.name,
                ok: true,
                ms: Date.now() - t0,
                category: testCase.category
            });
        } catch (e: any) {
            results.push({
                name: c.name,
                ok: false,
                error: String(e?.message ?? e),
                ms: Date.now() - t0,
                category: testCase.category
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
