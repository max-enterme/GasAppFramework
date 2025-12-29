/**
 * StringHelper共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../modules/testing-utils/test-utils';
import { setupTestAdapter, registerCollectedTests } from '../../../modules/testing-utils/test-adapter';
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
