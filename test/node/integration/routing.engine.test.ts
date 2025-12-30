/**
 * Routing Engine Integration Tests
 * ロギング、ミドルウェアスタックの実行順序など、統合テスト特有のテスト
 */

import { setupGASMocks, createMockLogger } from '../../../modules/testing-utils/test-utils';
import * as Routing from '../../../modules/routing';

type RouteHandler = Routing.Types.Ports.Handler;

// Set up GAS environment mocks before tests
beforeAll(() => {
    setupGASMocks();
});

describe('Routing Engine Integration Tests', () => {
    let logger: ReturnType<typeof createMockLogger>;

    beforeEach(() => {
        logger = createMockLogger();
    });

    describe('Logger Integration', () => {
        test('should log route registration and dispatch', () => {
            const router = Routing.create(logger);
            const handler: RouteHandler = (ctx) => `Hello, ${ctx.params.name}!`;

            router.register('/hello/:name', handler);

            const result = router.dispatch('/hello/world', { params: {} });
            expect(result).toBe('Hello, world!');
            expect(logger.info).toHaveBeenCalledWith('[Router] registered route: /hello/:name');
            expect(logger.info).toHaveBeenCalledWith('[Router] dispatching to route: /hello/world');
        });
    });

    describe('Middleware Execution Order', () => {
        test('should apply middleware to routes in correct order', () => {
            const router = Routing.create();
            const executionOrder: string[] = [];

            // Add middleware that logs execution
            router.use((ctx, next) => {
                executionOrder.push('middleware-start');
                const result = next();
                executionOrder.push('middleware-end');
                return result;
            });

            router.register('/test', () => {
                executionOrder.push('handler');
                return 'result';
            });

            const result = router.dispatch('/test', { params: {} });

            expect(result).toBe('result');
            expect(executionOrder).toEqual(['middleware-start', 'handler', 'middleware-end']);
        });

        test('should apply multiple middleware in correct order', () => {
            const router = Routing.create();
            const executionOrder: string[] = [];

            router.use((ctx, next) => {
                executionOrder.push('mw1-start');
                const result = next();
                executionOrder.push('mw1-end');
                return result;
            });

            router.use((ctx, next) => {
                executionOrder.push('mw2-start');
                const result = next();
                executionOrder.push('mw2-end');
                return result;
            });

            router.register('/test', () => {
                executionOrder.push('handler');
                return 'result';
            });

            router.dispatch('/test', { params: {} });

            expect(executionOrder).toEqual([
                'mw1-start', 'mw2-start', 'handler', 'mw2-end', 'mw1-end'
            ]);
        });

        test('should allow middleware to modify context', () => {
            const router = Routing.create();

            // Middleware that adds authentication info
            router.use((_ctx, next) => {
                _ctx.user = { id: 'user123', role: 'admin' };
                return next();
            });

            router.register('/secure', (ctx) => ({
                message: 'secure data',
                user: (ctx as any).user
            }));

            const result = router.dispatch('/secure', { params: {} });
            expect(result).toEqual({
                message: 'secure data',
                user: { id: 'user123', role: 'admin' }
            });
        });
    });

    describe('Complex Integration Scenarios', () => {
        test('should handle complex REST API routing with mixed types', () => {
            const router = Routing.create();

            // Mix of static, parameterized, and wildcard routes
            router.registerAll({
                '/': () => 'home',
                '/about': () => 'about',
                '/user/:id': (ctx) => `user-${ctx.params.id}`,
                '/admin/*': (ctx) => `admin-${ctx.params['*']}`,
                '/api/:version/:resource': (ctx) => `api-${ctx.params.version}-${ctx.params.resource}`
            });

            expect(router.dispatch('/', { params: {} })).toBe('home');
            expect(router.dispatch('/about', { params: {} })).toBe('about');
            expect(router.dispatch('/user/john', { params: {} })).toBe('user-john');
            expect(router.dispatch('/admin/settings/security', { params: {} })).toBe('admin-settings/security');
            expect(router.dispatch('/api/v2/users', { params: {} })).toBe('api-v2-users');
        });

        test('should handle nested resource routing', () => {
            const router = Routing.create();

            // Simulate REST API routes
            router.registerAll({
                '/api/users': () => ({ action: 'list_users' }),
                '/api/users/:id': (ctx) => ({ action: 'get_user', id: ctx.params.id }),
                '/api/users/:id/posts': (ctx) => ({ action: 'user_posts', userId: ctx.params.id }),
                '/api/users/:userId/posts/:postId': (ctx) => ({
                    action: 'get_post',
                    userId: ctx.params.userId,
                    postId: ctx.params.postId
                })
            });

            expect(router.dispatch('/api/users', { params: {} }))
                .toEqual({ action: 'list_users' });

            expect(router.dispatch('/api/users/123', { params: {} }))
                .toEqual({ action: 'get_user', id: '123' });

            expect(router.dispatch('/api/users/123/posts', { params: {} }))
                .toEqual({ action: 'user_posts', userId: '123' });

            expect(router.dispatch('/api/users/123/posts/456', { params: {} }))
                .toEqual({ action: 'get_post', userId: '123', postId: '456' });
        });
    });
});

