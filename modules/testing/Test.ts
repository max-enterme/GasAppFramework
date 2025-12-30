/**
 * Testing Module - Test Case Management
 */

export type TestFn = () => void;

export interface TestCase {
    name: string;
    fn: TestFn;
    category?: string;
}

// Use globalThis to share test registry across webpack bundles
const getTestRegistry = (): TestCase[] => {
    if (!(globalThis as any).__GAS_TEST_REGISTRY__) {
        (globalThis as any).__GAS_TEST_REGISTRY__ = [];
    }
    return (globalThis as any).__GAS_TEST_REGISTRY__;
};

const cases = getTestRegistry();

/**
 * Register a test case
 * @param name Test case name
 * @param fn Test function
 * @param category Optional category for grouping tests
 */
export function it(name: string, fn: TestFn, category?: string): void {
    cases.push({ name, fn, category });
}

/**
 * Get all registered test cases
 */
export function all(): TestCase[] {
    return cases.slice();
}

/**
 * Get test cases by category
 */
export function byCategory(category: string): TestCase[] {
    return cases.filter((c) => c.category === category);
}

/**
 * Get all unique categories
 */
export function categories(): string[] {
    const cats = new Set<string>();
    cases.forEach((c) => {
        if (c.category) cats.add(c.category);
    });
    return Array.from(cats).sort();
}

/**
 * Get test case with default category
 */
export function getCaseWithCategory(testCase: TestCase): TestCase & { category: string } {
    return {
        ...testCase,
        category: testCase.category || 'General'
    };
}

/**
 * Clear all registered test cases
 */
export function clear(): void {
    cases.length = 0;
}
