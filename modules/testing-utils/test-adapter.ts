/**
 * GAS Test Framework (T, TAssert) to Jest Adapter
 */

interface CollectedTest {
    description: string;
    testFn: () => void;
    category?: string;
}

const collectedTests: CollectedTest[] = [];

export const TestAdapter = {
    it(description: string, testFn: () => void, category?: string) {
        // Jest環境では常に収集モード
        if (typeof test !== 'undefined') {
            collectedTests.push({ description, testFn, category });
        } else {
            // GAS環境では通常の動作（必要に応じて実装）
            // 現時点ではGAS用の実装は不要
        }
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

/**
 * 収集したテストをJestに登録
 * describeブロック内で呼び出す必要がある
 *
 * @returns 登録されたテスト数
 */
export function registerCollectedTests(): number {
    const testsToRegister = [...collectedTests];
    collectedTests.length = 0;

    // カテゴリごとにグループ化
    const byCategory = new Map<string, CollectedTest[]>();

    for (const test of testsToRegister) {
        const category = test.category || 'Uncategorized';
        if (!byCategory.has(category)) {
            byCategory.set(category, []);
        }
        byCategory.get(category)!.push(test);
    }

    // カテゴリごとにdescribeを作成
    for (const [category, tests] of byCategory) {
        if (tests.length === 1 && category === 'Uncategorized') {
            // カテゴリなしで1つだけの場合は直接登録
            test(tests[0].description, tests[0].testFn);
        } else {
            // カテゴリごとにグループ化
            describe(category, () => {
                for (const { description, testFn } of tests) {
                    test(description, testFn);
                }
            });
        }
    }

    return testsToRegister.length;
}

/**
 * 収集されたテスト数を取得（デバッグ用）
 */
export function getCollectedTestCount(): number {
    return collectedTests.length;
}
