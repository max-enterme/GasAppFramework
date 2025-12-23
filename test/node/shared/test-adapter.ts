// test/node/shared/test-adapter.ts
/**
 * GASテストフレームワーク（T, TAssert）をJestにマッピングするアダプター
 */

export const TestAdapter = {
    it(description: string, testFn: () => void, category?: string) {
        // Jestのtest()にマッピング
        test(description, testFn);
    }
};

export const AssertAdapter = {
    equals(actual: any, expected: any, message?: string) {
        expect(actual).toBe(expected);
    },

    isTrue(value: boolean, message?: string) {
        expect(value).toBe(true);
    },

    isFalse(value: boolean, message?: string) {
        expect(value).toBe(false);
    },

    throws(fn: () => void, message?: string) {
        expect(fn).toThrow();
    },

    notThrows(fn: () => void, message?: string) {
        expect(fn).not.toThrow();
    },

    isNull(value: any, message?: string) {
        expect(value).toBeNull();
    },

    isNotNull(value: any, message?: string) {
        expect(value).not.toBeNull();
    },

    isDefined(value: any, message?: string) {
        expect(value).toBeDefined();
    },

    isUndefined(value: any, message?: string) {
        expect(value).toBeUndefined();
    }
};

/**
 * グローバルにT, TAssertを注入
 */
export function setupTestAdapter() {
    (globalThis as any).T = TestAdapter;
    (globalThis as any).TAssert = AssertAdapter;
}
