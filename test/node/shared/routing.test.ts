/**
 * Routing共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../src/testing/node/test-utils';
import { createRouter } from '../integration/routing-module';
import { registerRoutingCoreTests } from '../../shared/routing/core.test';
import { setupTestAdapter } from './test-adapter';

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

    test('静的ルートの登録とディスパッチ', () => {
        const router = createRouter();
        router.register('/hello', () => 'world');
        const result = router.dispatch('/hello', { params: {} });
        expect(result).toBe('world');
    });

    test('複数の静的ルート', () => {
        const router = createRouter();
        router.register('/api/status', () => ({ status: 'ok' }));
        router.register('/api/health', () => ({ health: 'good' }));

        const statusResult = router.dispatch('/api/status', { params: {} });
        const healthResult = router.dispatch('/api/health', { params: {} });

        expect(statusResult).toEqual({ status: 'ok' });
        expect(healthResult).toEqual({ health: 'good' });
    });

    test('パラメータマッチング: :id', () => {
        const router = createRouter();
        router.register('/user/:id', (ctx) => `user#${ctx.params.id}`);
        const result = router.dispatch('/user/42', { params: {} });
        expect(result).toBe('user#42');
    });

    test('パラメータマッチング: 複数パラメータ', () => {
        const router = createRouter();
        router.register('/org/:orgId/user/:userId', (ctx) =>
            `org=${ctx.params.orgId}, user=${ctx.params.userId}`
        );
        const result = router.dispatch('/org/acme/user/123', { params: {} });
        expect(result).toBe('org=acme, user=123');
    });

    test('ワイルドカードマッチング: *', () => {
        const router = createRouter();
        router.register('/files/*', (ctx) => `file:${ctx.params['*']}`);
        const result = router.dispatch('/files/a/b/c.txt', { params: {} });
        expect(result).toBe('file:a/b/c.txt');
    });

    test('ミドルウェアチェーン', () => {
        const router = createRouter();
        const seq: string[] = [];

        router.use((ctx, next) => {
            seq.push('mw1');
            return next();
        });
        router.use((ctx, next) => {
            seq.push('mw2');
            return next();
        });

        router.register('/test', () => 'result');

        router.dispatch('/test', { params: {} });
        router.dispatch('/test', { params: {} });

        expect(seq.join(',')).toBe('mw1,mw2,mw1,mw2');
    });

    // Note: Mount functionality is not fully implemented in the simplified routing-module
    // This test is covered in the integration tests
    test.skip('マウント機能: ネストされたルーター', () => {
        const api = createRouter();
        api.register('/v1/ping', () => 'pong');

        const root = createRouter();
        root.mount('/api', api);

        const result = root.dispatch('/api/v1/ping', { params: {} });
        expect(result).toBe('pong');
    });

    test('resolve: 見つからない場合はnull', () => {
        const router = createRouter();
        router.register('/exists', () => 'found');

        const found = router.resolve('/exists');
        const notFound = router.resolve('/not-exists');

        expect(found).not.toBeNull();
        expect(notFound).toBeNull();
    });

    test('dispatch: 見つからない場合は例外', () => {
        const router = createRouter();
        expect(() => router.dispatch('/not-found', { params: {} })).toThrow();
    });

    test('パラメータと静的セグメントの混在', () => {
        const router = createRouter();
        router.register('/api/:version/users/:id', (ctx) =>
            `${ctx.params.version}:${ctx.params.id}`
        );
        const result = router.dispatch('/api/v2/users/456', { params: {} });
        expect(result).toBe('v2:456');
    });
});
