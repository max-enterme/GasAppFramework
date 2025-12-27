/**
 * StringHelper共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../src/testing/node/test-utils';
import { setupTestAdapter, registerCollectedTests } from '../../../src/testing/node/test-adapter';
import { registerStringHelperCoreTests } from '../../shared/stringhelper/core.test';
import { formatString, resolveString, get } from '../integration/stringhelper-module';

// テストアダプターをセットアップ
setupTestAdapter();

// StringHelperモジュールをグローバルに注入
(globalThis as any).StringHelper = {
    formatString,
    resolveString,
    get
};

// GASモックをセットアップ
beforeAll(() => {
    setupGASMocks();
});

describe('StringHelper Core Tests (Shared)', () => {
    registerStringHelperCoreTests();
    registerCollectedTests();
});
