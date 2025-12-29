/**
 * Routing共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../modules/testing-utils/test-utils';
import { createRouter } from '../integration/routing-module';
import { registerRoutingCoreTests } from '../../shared/routing/core.test';
import { setupTestAdapter, registerCollectedTests } from '../../../modules/testing-utils/test-adapter';

// テストアダプターをセットアップ
setupTestAdapter();

// Routingモジュールをグローバルに注入
(globalThis as any).Routing = { create: createRouter };

// GASモックをセットアップ
beforeAll(() => {
    setupGASMocks();
});

describe('Routing Core Tests (Shared)', () => {
    registerRoutingCoreTests();
    registerCollectedTests();
});
