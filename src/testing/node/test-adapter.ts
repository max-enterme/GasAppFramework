/**
 * GAS Test Framework (T, TAssert) to Jest Adapter
 * 
 * This adapter allows shared test code written for GAS testing framework
 * to run seamlessly in Node.js/Jest environment.
 * 
 * Usage:
 * ```typescript
 * import { setupTestAdapter } from '@testing/node/test-adapter';
 * 
 * // Set up adapter before running shared tests
 * setupTestAdapter();
 * 
 * // Now shared tests using T and TAssert will work
 * registerSharedTests();
 * ```
 */

export const TestAdapter = {
    it(description: string, testFn: () => void, _category?: string) {
        // Map to Jest's test() function
        test(description, testFn);
    }
};

export const AssertAdapter = {
    equals(actual: any, expected: any, _message?: string) {
        expect(actual).toBe(expected);
    },

    isTrue(value: boolean, _message?: string) {
        expect(value).toBe(true);
    },

    isFalse(value: boolean, _message?: string) {
        expect(value).toBe(false);
    },

    throws(fn: () => void, _message?: string) {
        expect(fn).toThrow();
    },

    notThrows(fn: () => void, _message?: string) {
        expect(fn).not.toThrow();
    },

    isNull(value: any, _message?: string) {
        expect(value).toBeNull();
    },

    isNotNull(value: any, _message?: string) {
        expect(value).not.toBeNull();
    },

    isDefined(value: any, _message?: string) {
        expect(value).toBeDefined();
    },

    isUndefined(value: any, _message?: string) {
        expect(value).toBeUndefined();
    },

    fail(message?: string) {
        throw new Error(message || 'Assertion failed');
    }
};

/**
 * Inject T and TAssert into global scope
 * This allows shared test code to access these without imports
 */
export function setupTestAdapter() {
    (globalThis as any).T = TestAdapter;
    (globalThis as any).TAssert = AssertAdapter;
}
