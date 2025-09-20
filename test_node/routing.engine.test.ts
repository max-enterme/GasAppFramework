/**
 * Routing Engine Tests
 * Comprehensive Node.js tests for the Routing module functionality
 */

import { setupGASMocks, createMockLogger } from './test-utils';
import { createRouter, RouteContext, RouteHandler } from './routing-module';

// Set up GAS environment mocks before tests
beforeAll(() => {
    setupGASMocks();
});

describe('Routing Engine Tests', () => {
    let logger: ReturnType<typeof createMockLogger>;

    beforeEach(() => {
        logger = createMockLogger();
    });

    describe('Router Creation and Basic Functionality', () => {
        test('should create router instance successfully', () => {
            const router = createRouter();

            expect(router).toBeDefined();
            expect(typeof router.register).toBe('function');
            expect(typeof router.dispatch).toBe('function');
            expect(typeof router.resolve).toBe('function');
        });

        test('should register and dispatch to simple route', () => {
            const router = createRouter(logger);
            const handler: RouteHandler = (ctx) => `Hello, ${ctx.params.name}!`;

            router.register('/hello/:name', handler);

            const result = router.dispatch('/hello/world', { params: {} });
            expect(result).toBe('Hello, world!');
            expect(logger.info).toHaveBeenCalledWith('[Router] registered route: /hello/:name');
            expect(logger.info).toHaveBeenCalledWith('[Router] dispatching to route: /hello/world');
        });

        test('should handle static routes', () => {
            const router = createRouter();
            
            router.register('/api/status', () => ({ status: 'ok' }));
            router.register('/api/health', () => ({ health: 'good' }));

            const statusResult = router.dispatch('/api/status', { params: {} });
            const healthResult = router.dispatch('/api/health', { params: {} });

            expect(statusResult).toEqual({ status: 'ok' });
            expect(healthResult).toEqual({ health: 'good' });
        });
    });

    describe('Route Parameters', () => {
        test('should extract single parameter', () => {
            const router = createRouter();
            
            router.register('/user/:id', (ctx) => `User ID: ${ctx.params.id}`);

            const result = router.dispatch('/user/123', { params: {} });
            expect(result).toBe('User ID: 123');
        });

        test('should extract multiple parameters', () => {
            const router = createRouter();
            
            router.register('/org/:orgId/user/:userId', (ctx) => ({
                org: ctx.params.orgId,
                user: ctx.params.userId
            }));

            const result = router.dispatch('/org/acme/user/john', { params: {} });
            expect(result).toEqual({ org: 'acme', user: 'john' });
        });

        test('should handle URL encoded parameters', () => {
            const router = createRouter();
            
            router.register('/search/:query', (ctx) => `Query: ${ctx.params.query}`);

            const result = router.dispatch('/search/hello%20world', { params: {} });
            expect(result).toBe('Query: hello world');
        });

        test('should preserve existing context parameters', () => {
            const router = createRouter();
            
            router.register('/api/:version', (ctx) => ({
                version: ctx.params.version,
                existing: ctx.params.existing
            }));

            const result = router.dispatch('/api/v1', { 
                params: { existing: 'value' } 
            });
            
            expect(result).toEqual({ 
                version: 'v1', 
                existing: 'value' 
            });
        });
    });

    describe('Wildcard Routes', () => {
        test('should handle wildcard routes', () => {
            const router = createRouter();
            
            router.register('/files/*', (ctx) => `File path: ${ctx.params['*']}`);

            const result = router.dispatch('/files/docs/readme.txt', { params: {} });
            expect(result).toBe('File path: docs/readme.txt');
        });

        test('should handle wildcard at root', () => {
            const router = createRouter();
            
            router.register('/*', (ctx) => `Catch all: ${ctx.params['*']}`);

            const result = router.dispatch('/any/path/here', { params: {} });
            expect(result).toBe('Catch all: any/path/here');
        });
    });

    describe('Route Resolution and Specificity', () => {
        test('should resolve most specific route first', () => {
            const router = createRouter();
            
            // Register in order of increasing specificity
            router.register('/*', () => 'wildcard');
            router.register('/api/:action', () => 'param');
            router.register('/api/status', () => 'static');

            // Static route should take precedence
            const result = router.dispatch('/api/status', { params: {} });
            expect(result).toBe('static');
        });

        test('should fall back to less specific routes', () => {
            const router = createRouter();
            
            router.register('/*', () => 'wildcard');
            router.register('/api/:action', () => 'param');
            router.register('/api/status', () => 'static');

            // Should use param route for non-status API calls
            const result = router.dispatch('/api/users', { params: {} });
            expect(result).toBe('param');
        });

        test('should resolve route without dispatching', () => {
            const router = createRouter();
            const handler = (_ctx: RouteContext) => 'handled';
            
            router.register('/test/:id', handler);

            const resolved = router.resolve('/test/123');
            expect(resolved).toBeDefined();
            expect(resolved!.handler).toBe(handler);
            expect(resolved!.params).toEqual({ id: '123' });
        });

        test('should return null for unmatched routes', () => {
            const router = createRouter();
            
            router.register('/api/users', () => 'users');

            const resolved = router.resolve('/api/products');
            expect(resolved).toBeNull();
        });
    });

    describe('Route Registration', () => {
        test('should register multiple routes with registerAll', () => {
            const router = createRouter();
            
            const routes = {
                '/api/users': () => 'users',
                '/api/products': () => 'products',
                '/api/orders': () => 'orders'
            };

            router.registerAll(routes);

            expect(router.dispatch('/api/users', { params: {} })).toBe('users');
            expect(router.dispatch('/api/products', { params: {} })).toBe('products');
            expect(router.dispatch('/api/orders', { params: {} })).toBe('orders');
        });

        test('should handle path normalization', () => {
            const router = createRouter();
            
            // Register without leading slash
            router.register('api/test', () => 'normalized');

            // Should work with leading slash
            const result = router.dispatch('/api/test', { params: {} });
            expect(result).toBe('normalized');
        });
    });

    describe('Middleware Support', () => {
        test('should apply middleware to routes', () => {
            const router = createRouter();
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

        test('should apply multiple middleware in order', () => {
            const router = createRouter();
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
            const router = createRouter();

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

    describe('Error Handling', () => {
        test('should throw error for unmatched routes', () => {
            const router = createRouter();
            
            router.register('/api/users', () => 'users');

            expect(() => {
                router.dispatch('/api/products', { params: {} });
            }).toThrow('No route found for path: /api/products');
        });

        test('should propagate handler errors', () => {
            const router = createRouter();
            
            router.register('/error', () => {
                throw new Error('Handler error');
            });

            expect(() => {
                router.dispatch('/error', { params: {} });
            }).toThrow('Handler error');
        });
    });

    describe('Complex Routing Scenarios', () => {
        test('should handle complex REST API routing', () => {
            const router = createRouter();
            
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

        test('should handle mixed route types effectively', () => {
            const router = createRouter();
            
            // Mix of static, parameterized, and wildcard routes
            router.registerAll({
                '/': () => 'home',
                '/about': () => 'about',
                '/user/:id': (ctx) => `user-${ctx.params.id}`,
                '/admin/*': (ctx) => `admin-${ctx.params['*']}`,
                '/api/:version/:resource': (ctx) => `api-${ctx.params.version}-${ctx.params.resource}` // Simplified pattern
            });

            expect(router.dispatch('/', { params: {} })).toBe('home');
            expect(router.dispatch('/about', { params: {} })).toBe('about');
            expect(router.dispatch('/user/john', { params: {} })).toBe('user-john');
            expect(router.dispatch('/admin/settings/security', { params: {} })).toBe('admin-settings/security');
            expect(router.dispatch('/api/v2/users', { params: {} })).toBe('api-v2-users');
        });
    });
});