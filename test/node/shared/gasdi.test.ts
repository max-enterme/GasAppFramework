/**
 * GasDI共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../modules/testing-utils/test-utils';
import * as GasDI from '../../../modules/di';

// GasDIモジュールをグローバルに注入
(globalThis as any).GasDI = GasDI;

// GASモックをセットアップ
beforeAll(() => {
    setupGASMocks();
});

// 共通テストをimport（自動的にテストが登録される）
import '../../shared/gasdi/core.test';

describe('GasDI Core Tests (Shared)', () => {
    // テストは既にimportによって登録されています
    it('should run shared tests', () => {
        expect(true).toBe(true);
    });
});
