/**
 * Repository共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../modules/testing-utils/test-utils';
import { setupTestAdapter, registerCollectedTests } from '../../../modules/testing-utils/test-adapter';
import { registerRepositoryCoreTests } from '../../shared/repository/core.test';
import { createRepository, MemoryStore, createSimpleCodec } from '../integration/repository-module';

// テストアダプターをセットアップ
setupTestAdapter();

// Repositoryモジュールをグローバルに注入
(globalThis as any).Repository = {
    Engine: { create: createRepository },
    Adapters: { Memory: { Store: MemoryStore } },
    Codec: { simple: createSimpleCodec }
};

// Shared.Types.Logger用のダミー型を注入
(globalThis as any).Shared = {
    Types: {}
};

// GASモックをセットアップ
beforeAll(() => {
    setupGASMocks();
});

describe('Repository Core Tests (Shared)', () => {
    registerRepositoryCoreTests();
    registerCollectedTests();
});
