/**
 * Locking共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '@/testing-utils/test-utils';
import * as LockingModule from '@/locking';

// Lockingモジュールをグローバルに注入
(globalThis as any).Locking = LockingModule;

// GASモックをセットアップ
beforeAll(() => {
    setupGASMocks();
});

// 共通テストをimport（自動的にテストが登録される）
import '../../shared/locking/core.test';

describe('Locking Core Tests (Shared)', () => {
    it('should run shared tests', () => {
        expect(true).toBe(true);
    });
});
