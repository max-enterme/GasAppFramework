/**
 * GasDI共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../modules/testing-utils/test-utils';
import { setupTestAdapter, registerCollectedTests } from '../../../modules/testing-utils/test-adapter';
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
