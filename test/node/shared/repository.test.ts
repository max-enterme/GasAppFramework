/**
 * Repository共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../modules/testing-utils/test-utils';
import * as Repository from '../../../modules/repository';

// Repositoryモジュールをグローバルに注入
(globalThis as any).Repository = Repository;

// GASモックをセットアップ
beforeAll(() => {
    setupGASMocks();
});

// 共通テストをimport（自動的にテストが登録される）
import '../../shared/repository/core.test';

describe('Repository Core Tests (Shared)', () => {
    it('should run shared tests', () => {
        expect(true).toBe(true);
    });
});
