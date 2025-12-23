/**
 * Locking共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../src/testing/node/test-utils';
import { setupTestAdapter } from '../../../src/testing/node/test-adapter';
import { registerLockingCoreTests } from '../../shared/locking/core.test';
import * as LockingModule from '../integration/locking-module';

// テストアダプターをセットアップ
setupTestAdapter();

// Lockingモジュールをグローバルに注入
(globalThis as any).Locking = LockingModule;

// GASモックをセットアップ
beforeAll(() => {
    setupGASMocks();
});

describe('Locking Core Tests (Shared)', () => {
    registerLockingCoreTests();
});
