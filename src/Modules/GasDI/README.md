# GasDI Module

A lightweight dependency injection container for Google Apps Script applications, providing support for multiple lifetime management strategies and hierarchical dependency resolution.

## Features

- **Multiple Lifetimes**: Singleton, scoped, and transient dependency lifetimes
- **Type Safety**: Branded tokens for compile-time type safety
- **Hierarchical Resolution**: Parent-child container relationships
- **Factory Registration**: Support for factory functions and class constructors
- **Flexible Scoping**: Create scoped containers for request-level dependencies
- **Optional Dependencies**: Graceful handling of missing dependencies

## Main APIs

### Container Creation and Registration
```typescript
// Create container
const container = new GasDI.Container()

// Register value
container.registerValue('config', { apiKey: 'abc123', timeout: 5000 })

// Register factory function
container.registerFactory('logger', () => console, 'singleton')

// Register class
container.registerClass('userService', UserService, 'scoped')

// Register with custom factory
container.registerFactory('database', () => {
    return new DatabaseConnection(process.env.DB_URL)
}, 'singleton')
```

### Dependency Resolution
```typescript
// Resolve dependencies
const config = container.resolve('config')
const logger = container.resolve('logger') 
const userService = container.resolve('userService')

// Optional resolution
const optionalService = container.resolve('optionalService', { optional: true })
if (optionalService) {
    // Use service if available
}
```

### Scoped Containers
```typescript
// Create scoped container for request handling
const requestScope = container.createScope('request-123')

// Register request-specific dependencies
requestScope.registerValue('requestId', 'req-123')
requestScope.registerValue('currentUser', { id: 'user1', name: 'John' })

// Resolve within scope
const requestId = requestScope.resolve('requestId')
const currentUser = requestScope.resolve('currentUser')

// Cleanup scope when done
// (automatic garbage collection when requestScope goes out of scope)
```

## Usage Examples

### Basic Service Registration
```typescript
// Token definitions for type safety
const TOKENS = {
    CONFIG: 'config' as GasDI.Ports.Token<AppConfig>,
    LOGGER: 'logger' as GasDI.Ports.Token<Logger>,
    USER_SERVICE: 'userService' as GasDI.Ports.Token<UserService>,
    SPREADSHEET_SERVICE: 'spreadsheetService' as GasDI.Ports.Token<SpreadsheetService>
}

interface AppConfig {
    spreadsheetId: string
    environment: 'dev' | 'prod'
}

interface Logger {
    info(msg: string): void
    error(msg: string): void
}

class UserService {
    constructor(
        private config: AppConfig,
        private logger: Logger,
        private spreadsheetService: SpreadsheetService
    ) {}
    
    findUser(id: string) {
        this.logger.info(`Finding user: ${id}`)
        return this.spreadsheetService.getUser(id)
    }
}

// Setup container
const container = new GasDI.Container()

container.registerValue(TOKENS.CONFIG, {
    spreadsheetId: 'your-sheet-id',
    environment: 'prod'
})

container.registerFactory(TOKENS.LOGGER, () => ({
    info: (msg: string) => console.log(msg),
    error: (msg: string) => console.error(msg)
}), 'singleton')

container.registerFactory(TOKENS.SPREADSHEET_SERVICE, () => {
    const config = container.resolve(TOKENS.CONFIG)
    return new SpreadsheetService(config.spreadsheetId)
}, 'singleton')

container.registerFactory(TOKENS.USER_SERVICE, () => {
    return new UserService(
        container.resolve(TOKENS.CONFIG),
        container.resolve(TOKENS.LOGGER),
        container.resolve(TOKENS.SPREADSHEET_SERVICE)
    )
}, 'scoped')
```

### GAS Web App with Request Scoping
```typescript
// Global container setup
const globalContainer = new GasDI.Container()
globalContainer.registerValue(TOKENS.CONFIG, { /* global config */ })
globalContainer.registerFactory(TOKENS.LOGGER, () => console, 'singleton')

// Web app entry point
function doGet(e: GoogleAppsScript.Events.DoGet) {
    // Create request scope
    const requestContainer = globalContainer.createScope(`request-${Date.now()}`)
    
    // Register request-specific data
    requestContainer.registerValue('requestParams', e.parameter)
    requestContainer.registerValue('requestUrl', e.url)
    
    // Resolve services for this request
    const userService = requestContainer.resolve(TOKENS.USER_SERVICE)
    const logger = requestContainer.resolve(TOKENS.LOGGER)
    
    try {
        const result = handleRequest(userService, e.parameter)
        return ContentService.createTextOutput(JSON.stringify(result))
    } catch (error) {
        logger.error(`Request failed: ${error.message}`)
        return ContentService.createTextOutput('Error')
    }
}
```

### Hierarchical Container Setup
```typescript
// Parent container for shared services
const appContainer = new GasDI.Container()
appContainer.registerFactory(TOKENS.LOGGER, () => console, 'singleton')
appContainer.registerValue(TOKENS.CONFIG, globalConfig)

// Child container for module-specific services
const moduleContainer = new GasDI.Container(appContainer)
moduleContainer.registerFactory('moduleService', () => new ModuleService(), 'singleton')

// Child can resolve parent dependencies
const logger = moduleContainer.resolve(TOKENS.LOGGER) // Resolves from parent
const moduleService = moduleContainer.resolve('moduleService') // Resolves from child
```

## Testing Strategy

### Unit Tests (Node.js)
```typescript
describe('GasDI Container', () => {
    let container: GasDI.Container
    
    beforeEach(() => {
        container = new GasDI.Container()
    })
    
    test('should register and resolve values', () => {
        container.registerValue('test', 'value')
        expect(container.resolve('test')).toBe('value')
    })
    
    test('should support singleton lifetime', () => {
        let callCount = 0
        container.registerFactory('service', () => {
            callCount++
            return { id: callCount }
        }, 'singleton')
        
        const instance1 = container.resolve('service')
        const instance2 = container.resolve('service')
        
        expect(instance1).toBe(instance2)
        expect(callCount).toBe(1)
    })
    
    test('should support scoped containers', () => {
        const scope1 = container.createScope('scope1')
        const scope2 = container.createScope('scope2')
        
        scope1.registerValue('data', 'scope1-data')
        scope2.registerValue('data', 'scope2-data')
        
        expect(scope1.resolve('data')).toBe('scope1-data')
        expect(scope2.resolve('data')).toBe('scope2-data')
    })
})
```

### Integration Tests (GAS)
```typescript
function test_DIContainer() {
    const container = new GasDI.Container()
    
    // Test with real GAS services
    container.registerFactory('spreadsheetService', () => {
        return SpreadsheetApp.openById('test-sheet-id')
    }, 'singleton')
    
    container.registerFactory('logger', () => {
        return {
            info: (msg: string) => Logger.log(`INFO: ${msg}`),
            error: (msg: string) => Logger.log(`ERROR: ${msg}`)
        }
    }, 'singleton')
    
    const spreadsheet = container.resolve('spreadsheetService')
    const logger = container.resolve('logger')
    
    logger.info('DI container test completed')
    console.log('Spreadsheet name:', spreadsheet.getName())
}
```

### Mock Dependencies for Testing
```typescript
// Test doubles using DI
function createTestContainer() {
    const container = new GasDI.Container()
    
    // Mock logger
    const mockLogger = {
        info: jest.fn(),
        error: jest.fn()
    }
    container.registerValue(TOKENS.LOGGER, mockLogger)
    
    // Mock config
    container.registerValue(TOKENS.CONFIG, {
        spreadsheetId: 'test-sheet',
        environment: 'test'
    })
    
    return { container, mockLogger }
}

test('service uses logger correctly', () => {
    const { container, mockLogger } = createTestContainer()
    
    container.registerFactory(TOKENS.USER_SERVICE, () => {
        return new UserService(
            container.resolve(TOKENS.CONFIG),
            container.resolve(TOKENS.LOGGER),
            container.resolve(TOKENS.SPREADSHEET_SERVICE)
        )
    })
    
    const userService = container.resolve(TOKENS.USER_SERVICE)
    userService.findUser('test123')
    
    expect(mockLogger.info).toHaveBeenCalledWith('Finding user: test123')
})
```

## Configuration

### Lifetime Management
- **Singleton**: Single instance shared across entire container lifetime
- **Scoped**: Single instance per scope (useful for request-level services)
- **Transient**: New instance created for each resolution

### Best Practices
- Use branded tokens for type safety
- Register expensive services as singletons
- Use scoped lifetime for request-specific data
- Keep container setup in a separate configuration module
- Avoid circular dependencies between services

### Performance Considerations
- Singleton services are cached and reused
- Scoped services are cached within their scope
- Transient services have no caching overhead
- Parent container lookup has minimal performance impact