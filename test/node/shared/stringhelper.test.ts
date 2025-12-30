/**
 * StringHelper共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../modules/testing-utils/test-utils';
import * as StringHelper from '../../../modules/string-helper';

// StringHelperモジュールをグローバルに注入
(globalThis as any).StringHelper = StringHelper;

// GASモックをセットアップ
beforeAll(() => {
    setupGASMocks();
});

// 共通テストをimport（自動的にテストが登録される）
import '../../shared/stringhelper/core.test';

describe('StringHelper Core Tests (Shared)', () => {
    it('should run shared tests', () => {
        expect(true).toBe(true);
    });
});
