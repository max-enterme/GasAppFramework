/**
 * Routing Engine Tests for Node.js
 * Modern test implementation following Jest best practices
 */

import { loadNamespaceTs } from './helpers/loadNamespace'

// Load the required namespaces for testing
loadNamespaceTs('src/Modules/Routing/Engine.ts')

// Access Routing namespace from global scope
const Routing = (global as any).Routing

describe('Routing Engine (Node.js)', () => {
    test('should match route parameters correctly', () => {
        const router = Routing.create()
        
        // Register a route with parameter
        router.register('/users/:id', (ctx: any) => ctx.params.id)
        
        // Dispatch request and verify parameter extraction
        const result = router.dispatch('/users/42', {} as any)
        
        expect(result).toBe('42')
    })

    test('should handle static routes', () => {
        const router = Routing.create()
        
        router.register('/health', () => 'OK')
        
        const result = router.dispatch('/health', {} as any)
        expect(result).toBe('OK')
    })

    test('should handle multiple parameters', () => {
        const router = Routing.create()
        
        router.register('/users/:userId/posts/:postId', (ctx: any) => {
            return `User: ${ctx.params.userId}, Post: ${ctx.params.postId}`
        })
        
        const result = router.dispatch('/users/123/posts/456', {} as any)
        expect(result).toBe('User: 123, Post: 456')
    })

    test('should handle wildcard routes', () => {
        const router = Routing.create()
        
        router.register('/files/*', (_ctx: any) => `Wildcard matched`)
        
        const result = router.dispatch('/files/documents/test.txt', {} as any)
        expect(result).toBe('Wildcard matched')
    })

    test('should prioritize specific routes over parameterized ones', () => {
        const router = Routing.create()
        
        // Register parameterized route first
        router.register('/users/:id', () => 'parameterized')
        
        // Register specific route
        router.register('/users/admin', () => 'specific')
        
        // Specific route should take precedence
        const result = router.dispatch('/users/admin', {} as any)
        expect(result).toBe('specific')
    })
})
