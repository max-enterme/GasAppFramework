/**
 * GasDI共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../src/testing/node/test-utils';
import { setupTestAdapter, registerCollectedTests } from '../../../src/testing/node/test-adapter';
import { registerGasDICoreTests } from '../../shared/gasdi/core.test';
import { Container } from '../integration/gasdi-module';

// テストアダプターをセットアップ
setupTestAdapter();

// GasDIモジュールをグローバルに注入
(globalThis as any).GasDI = {
    Container: Container
};

// GASモックをセットアップ
beforeAll(() => {
    setupGASMocks();
});

describe('GasDI Core Tests (Shared)', () => {
    registerGasDICoreTests();
    registerCollectedTests();
});
