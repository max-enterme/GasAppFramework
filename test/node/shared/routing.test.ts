/**
 * Routing共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../modules/testing-utils/test-utils';
import * as Routing from '../../../modules/routing';

// Routingモジュールをグローバルに注入
(globalThis as any).Routing = Routing;

// GASモックをセットアップ
beforeAll(() => {
    setupGASMocks();
});

// 共通テストをimport（自動的にテストが登録される）
import '../../shared/routing/core.test';

describe('Routing Core Tests (Shared)', () => {
    it('should run shared tests', () => {
        expect(true).toBe(true);
    });
});
