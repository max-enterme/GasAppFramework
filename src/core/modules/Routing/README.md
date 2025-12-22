# Routing Module

A flexible HTTP-style routing system for Google Apps Script web applications, supporting parameterized routes, wildcards, middleware, and hierarchical route mounting.

## Features

- **Parameterized Routes**: Extract parameters from URLs with `:param` syntax
- **Wildcard Routes**: Catch-all routes with `*` syntax
- **Middleware Support**: Add pre/post-processing middleware
- **Route Mounting**: Compose routers with path prefixes
- **Type Safety**: Full TypeScript support for context and response types
- **Path Matching**: Efficient route matching with specificity ordering

## Main APIs

### Router Creation and Registration
```typescript
// Create router
const router = Routing.create<RequestContext, HtmlOutput>()

// Register simple routes
router.register('/api/users', (ctx) => {
    return HtmlService.createHtmlOutput('Users list')
})

// Register parameterized routes
router.register('/api/users/:id', (ctx) => {
    const userId = ctx.params.id
    return HtmlService.createHtmlOutput(`User: ${userId}`)
})

// Register wildcard routes
router.register('/static/*', (ctx) => {
    const filePath = ctx.params['*']
    return serveStaticFile(filePath)
})
```

### Middleware
```typescript
// Add logging middleware
router.use((ctx, next) => {
    console.log(`Request: ${ctx.path}`)
    const result = next(ctx)
    console.log(`Response: ${result.getContent()}`)
    return result
})

// Add authentication middleware
router.use((ctx, next) => {
    if (!ctx.user) {
        return HtmlService.createHtmlOutput('Unauthorized')
    }
    return next(ctx)
})
```

### Route Mounting
```typescript
// Create sub-routers
const apiRouter = Routing.create()
apiRouter.register('/users', handleUsers)
apiRouter.register('/orders', handleOrders)

const adminRouter = Routing.create()
adminRouter.register('/dashboard', handleDashboard)
adminRouter.register('/settings', handleSettings)

// Mount sub-routers
const mainRouter = Routing.create()
mainRouter.mount('/api', apiRouter)
mainRouter.mount('/admin', adminRouter)

// Routes become:
// /api/users, /api/orders
// /admin/dashboard, /admin/settings
```

## Usage Examples

### Basic Web App Routing
```typescript
interface RequestContext {
    path: string
    params: { [key: string]: string }
    query: { [key: string]: string }
    user?: User
}

// Setup router
const router = Routing.create<RequestContext, GoogleAppsScript.HTML.HtmlOutput>()

// Home page
router.register('/', (ctx) => {
    return HtmlService.createHtmlOutputFromFile('index')
})

// User profile page
router.register('/users/:id', (ctx) => {
    const userId = ctx.params.id
    const user = getUserById(userId)
    
    const template = HtmlService.createTemplateFromFile('user-profile')
    template.user = user
    return template.evaluate()
})

// API endpoints
router.register('/api/users', (ctx) => {
    const users = getAllUsers()
    return HtmlService.createHtmlOutput(JSON.stringify(users))
        .setMimeType(ContentService.MimeType.JSON)
})

// Catch-all for 404
router.register('/*', (ctx) => {
    return HtmlService.createHtmlOutputFromFile('404')
        .setTitle('Page Not Found')
})

// GAS doGet function
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput {
    const ctx: RequestContext = {
        path: e.pathInfo || '/',
        params: {},
        query: e.parameter || {}
    }
    
    return router.dispatch(ctx.path, ctx)
}
```

### REST API with Route Groups
```typescript
// Create API router
const apiRouter = Routing.create<ApiContext, ContentService.TextOutput>()

// Users resource
const usersRouter = Routing.create<ApiContext, ContentService.TextOutput>()
usersRouter.register('/', (ctx) => {
    // GET /api/users
    const users = userService.getAll()
    return createJsonResponse(users)
})

usersRouter.register('/:id', (ctx) => {
    // GET /api/users/123
    const user = userService.getById(ctx.params.id)
    return createJsonResponse(user)
})

// Orders resource  
const ordersRouter = Routing.create<ApiContext, ContentService.TextOutput>()
ordersRouter.register('/', (ctx) => {
    // GET /api/orders
    const orders = orderService.getAll()
    return createJsonResponse(orders)
})

ordersRouter.register('/:id', (ctx) => {
    // GET /api/orders/456
    const order = orderService.getById(ctx.params.id)
    return createJsonResponse(order)
})

// Mount resource routers
apiRouter.mount('/users', usersRouter)
apiRouter.mount('/orders', ordersRouter)

// Mount API router
const mainRouter = Routing.create<ApiContext, ContentService.TextOutput>()
mainRouter.mount('/api', apiRouter)

function createJsonResponse(data: any): GoogleAppsScript.Content.TextOutput {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON)
}
```

### Authentication and Authorization
```typescript
// Authentication middleware
const authMiddleware: Routing.Ports.Middleware<RequestContext, HtmlOutput> = (ctx, next) => {
    const token = ctx.query.token
    if (!token) {
        return HtmlService.createHtmlOutput('Authentication required')
    }
    
    const user = validateToken(token)
    if (!user) {
        return HtmlService.createHtmlOutput('Invalid token')
    }
    
    ctx.user = user
    return next(ctx)
}

// Authorization middleware for admin routes
const adminMiddleware: Routing.Ports.Middleware<RequestContext, HtmlOutput> = (ctx, next) => {
    if (!ctx.user || ctx.user.role !== 'admin') {
        return HtmlService.createHtmlOutput('Admin access required')
    }
    return next(ctx)
}

// Apply middleware
const router = Routing.create<RequestContext, HtmlOutput>()

// Public routes (no middleware)
router.register('/', (ctx) => HtmlService.createHtmlOutputFromFile('public'))

// Protected routes
router.use(authMiddleware)
router.register('/dashboard', (ctx) => {
    const template = HtmlService.createTemplateFromFile('dashboard')
    template.user = ctx.user
    return template.evaluate()
})

// Admin routes (auth + admin middleware)
const adminRouter = Routing.create<RequestContext, HtmlOutput>()
adminRouter.use(authMiddleware)
adminRouter.use(adminMiddleware)
adminRouter.register('/users', handleAdminUsers)
adminRouter.register('/settings', handleAdminSettings)

router.mount('/admin', adminRouter)
```

## Testing Strategy

### Unit Tests (Node.js)
```typescript
describe('Routing Engine', () => {
    let router: Routing.Router<TestContext, string>
    
    beforeEach(() => {
        router = Routing.create<TestContext, string>()
    })
    
    test('should match static routes', () => {
        router.register('/users', (ctx) => 'users')
        
        const result = router.dispatch('/users', { path: '/users', params: {} })
        expect(result).toBe('users')
    })
    
    test('should extract route parameters', () => {
        router.register('/users/:id', (ctx) => `user-${ctx.params.id}`)
        
        const result = router.dispatch('/users/123', { path: '/users/123', params: {} })
        expect(result).toBe('user-123')
    })
    
    test('should handle wildcard routes', () => {
        router.register('/files/*', (ctx) => `file-${ctx.params['*']}`)
        
        const result = router.dispatch('/files/docs/readme.txt', { 
            path: '/files/docs/readme.txt', 
            params: {} 
        })
        expect(result).toBe('file-docs/readme.txt')
    })
    
    test('should apply middleware in order', () => {
        const calls: string[] = []
        
        router.use((ctx, next) => {
            calls.push('middleware1')
            return next(ctx)
        })
        
        router.use((ctx, next) => {
            calls.push('middleware2')
            return next(ctx)
        })
        
        router.register('/test', (ctx) => {
            calls.push('handler')
            return 'result'
        })
        
        router.dispatch('/test', { path: '/test', params: {} })
        expect(calls).toEqual(['middleware1', 'middleware2', 'handler'])
    })
})
```

### Integration Tests (GAS)
```typescript
function test_WebAppRouting() {
    // Test with mock GAS environment
    const router = Routing.create<RequestContext, GoogleAppsScript.HTML.HtmlOutput>()
    
    router.register('/', (ctx) => {
        return HtmlService.createHtmlOutput('<h1>Home</h1>')
    })
    
    router.register('/users/:id', (ctx) => {
        return HtmlService.createHtmlOutput(`<h1>User ${ctx.params.id}</h1>`)
    })
    
    // Test routing
    const homeResult = router.dispatch('/', { path: '/', params: {}, query: {} })
    console.log('Home result:', homeResult.getContent())
    
    const userResult = router.dispatch('/users/123', { 
        path: '/users/123', 
        params: {}, 
        query: {} 
    })
    console.log('User result:', userResult.getContent())
}
```

### Performance Tests
```typescript
test('should handle large route tables efficiently', () => {
    const router = Routing.create()
    
    // Register many routes
    for (let i = 0; i < 1000; i++) {
        router.register(`/route${i}`, (ctx) => `result${i}`)
    }
    
    const start = Date.now()
    const result = router.dispatch('/route500', { path: '/route500', params: {} })
    const elapsed = Date.now() - start
    
    expect(result).toBe('result500')
    expect(elapsed).toBeLessThan(10) // Should be fast
})
```

## Configuration

### Route Patterns
- **Static**: `/users` - Exact path match
- **Parameter**: `/users/:id` - Extract named parameter
- **Wildcard**: `/files/*` - Match remaining path segments

### Middleware Order
- Middleware is applied in registration order
- Each middleware can modify context before calling `next()`
- Middleware can return early to short-circuit request

### Best Practices
- Use specific routes before general ones
- Apply authentication middleware early
- Group related routes with sub-routers
- Use wildcard routes for catch-all error handling
- Keep route handlers focused and lightweight