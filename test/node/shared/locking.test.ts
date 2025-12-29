/**
 * Locking共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../modules/testing-utils/test-utils';
import { setupTestAdapter, registerCollectedTests } from '../../../modules/testing-utils/test-adapter';
import { registerLockingCoreTests } from '../../shared/locking/core.test';
import * as LockingModule from '../../../modules/locking';

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
    registerCollectedTests();
});
