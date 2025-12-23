# Dependency Injection (DI) Guide for GasAppFramework

This document provides comprehensive guidance on dependency injection patterns used throughout the GasAppFramework, including when and how to use DI, and the distinction between mandatory and optional components.

## Table of Contents

1. [Overview](#overview)
2. [DI Architecture](#di-architecture)
3. [Mandatory vs Optional Components](#mandatory-vs-optional-components)
4. [Using GasDI Container](#using-gasdi-container)
5. [DI Patterns in Framework Modules](#di-patterns-in-framework-modules)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Testing with DI](#testing-with-di)

## Overview

The GasAppFramework uses **GasDI** (Google Apps Script Dependency Injection) as its dependency injection container. DI enables:

- **Loose coupling**: Components depend on abstractions, not concrete implementations
- **Testability**: Easy to mock dependencies in tests
- **Flexibility**: Swap implementations without changing client code
- **Lifecycle management**: Control when and how dependencies are created

## DI Architecture

### Core DI Components

```
GasDI Module
├── Container          # IoC container for registering and resolving dependencies
├── Decorators         # @Resolve() decorator for automatic dependency resolution
├── Root              # Global singleton container instance
└── Types             # Token types and interfaces
```

### Container Lifetimes

GasDI supports three dependency lifetimes:

1. **Singleton**: One instance for entire application lifetime
   ```typescript
   container.registerFactory('logger', () => new Logger(), 'singleton')
   ```

2. **Scoped**: One instance per scope (e.g., per HTTP request)
   ```typescript
   container.registerFactory('requestContext', () => new RequestContext(), 'scoped')
   ```

3. **Transient**: New instance every time it's resolved
   ```typescript
   container.registerFactory('validator', () => new Validator(), 'transient')
   ```

## Mandatory vs Optional Components

Understanding the distinction between mandatory and optional components is crucial for proper framework usage.

### Mandatory Components

**Definition**: Components required for the framework to function properly.

**Characteristics**:
- Must be provided by the developer
- Framework cannot operate without them
- Typically passed directly in constructors
- Located in `interfaces/` directories

**Examples in RestFramework**:
- `RequestMapper`: Maps raw input to typed requests
- `ResponseMapper`: Maps business results to API responses
- `ApiLogic`: Contains core business logic

**Usage Pattern**:
```typescript
class MyController extends RestFramework.ApiController<MyRequest, MyResponse> {
    constructor() {
        super(
            new MyRequestMapper(),      // Mandatory - direct instantiation
            new MyResponseMapper(),     // Mandatory - direct instantiation
            new MyApiLogic()            // Mandatory - direct instantiation
        );
    }
}
```

### Optional Components

**Definition**: Components that enhance functionality but aren't required for basic operation.

**Characteristics**:
- Framework works without them
- Injected via DI container
- Enable advanced features (validation, auth, middleware, logging)
- Located in `optional-utilities/` directories

**Examples in RestFramework**:
- `RequestValidator`: Input validation
- `AuthService`: Authentication and authorization
- `MiddlewareManager`: Request/response pipeline
- `Logger`: Logging functionality
- `ErrorHandler`: Error formatting

**Usage Pattern**:
```typescript
class MyController extends RestFramework.ApiController<MyRequest, MyResponse> {
    constructor() {
        super(
            new MyRequestMapper(),
            new MyResponseMapper(),
            new MyApiLogic(),
            GasDI.Root.resolve('requestValidator', { optional: true }),  // Optional via DI
            GasDI.Root.resolve('authService', { optional: true }),       // Optional via DI
            GasDI.Root.resolve('middlewareManager', { optional: true }), // Optional via DI
            GasDI.Root.resolve('logger', { optional: true }),            // Optional via DI
            GasDI.Root.resolve('errorHandler', { optional: true })       // Optional via DI
        );
    }
}
```

### Comparison Table

| Aspect | Mandatory Components | Optional Components |
|--------|---------------------|-------------------|
| **Required** | Yes | No |
| **Injection Method** | Direct instantiation | DI container resolution |
| **Location** | `interfaces/` | `optional-utilities/` |
| **Purpose** | Core functionality | Feature enhancement |
| **Framework Behavior Without** | Cannot operate | Works with reduced functionality |
| **Examples** | RequestMapper, ResponseMapper, ApiLogic | RequestValidator, AuthService, MiddlewareManager |

## Using GasDI Container

### Basic Registration and Resolution

```typescript
// Create container instance (or use global Root)
const container = new GasDI.Container();

// Register value (singleton by default)
container.registerValue('config', {
    apiUrl: 'https://api.example.com',
    timeout: 5000
});

// Register factory
container.registerFactory('logger', () => {
    return new CustomLogger('[MyApp]');
}, 'singleton');

// Register class
container.registerClass('userService', UserService, 'scoped');

// Resolve dependencies
const config = container.resolve('config');
const logger = container.resolve('logger');
const userService = container.resolve('userService');
```

### Global Container (GasDI.Root)

The framework provides a global singleton container for application-wide dependencies:

```typescript
// Register in application initialization
function initializeApp() {
    GasDI.Root.registerValue('logger', RestFramework.Logger.create('[API]'));
    GasDI.Root.registerValue('authService', new MyAuthService());
    GasDI.Root.registerValue('requestValidator', new MyValidator());
}

// Resolve anywhere in your application
const logger = GasDI.Root.resolve('logger');
```

### Optional Resolution

Use optional resolution when a dependency might not be registered:

```typescript
// Returns undefined if not registered
const optionalService = container.resolve('optionalService', { optional: true });

if (optionalService) {
    optionalService.doSomething();
} else {
    // Fallback behavior
    console.log('Optional service not available');
}
```

### Typed Tokens

Use branded types for compile-time type safety:

```typescript
// Define typed tokens
const TOKENS = {
    LOGGER: 'logger' as GasDI.Ports.Token<Shared.Types.Logger>,
    AUTH_SERVICE: 'authService' as GasDI.Ports.Token<RestFramework.Types.AuthService>,
    CONFIG: 'config' as GasDI.Ports.Token<AppConfig>
};

// Register with tokens
GasDI.Root.registerValue(TOKENS.LOGGER, new Logger());

// Resolve with type safety
const logger: Shared.Types.Logger = GasDI.Root.resolve(TOKENS.LOGGER);
```

## DI Patterns in Framework Modules

### RestFramework

**DI-Enabled Components**:
- `Logger`: Logging service (optional)
- `ErrorHandler`: Error formatting (optional)
- `RequestValidator`: Input validation (optional)
- `AuthService`: Authentication/authorization (optional)
- `MiddlewareManager`: Request pipeline (optional)

**Registration Example**:
```typescript
// Setup optional services
GasDI.Root.registerValue('logger', RestFramework.Logger.create('[MyAPI]'));
GasDI.Root.registerValue('requestValidator', new MyRequestValidator());
GasDI.Root.registerValue('authService', new MyAuthService());
```

### Repository Module

**DI-Enabled Components**:
- `Store`: Data storage backend (mandatory via constructor or DI)
- `KeyCodec`: Key encoding strategy (mandatory via constructor or DI)
- `Logger`: Logging (optional)

**Pattern**:
```typescript
// Direct instantiation (common pattern)
const repo = Repository.Engine.create({
    schema: mySchema,
    store: Repository.Adapters.GAS.SpreadsheetStore.create(spreadsheetId),
    keyCodec: Repository.Codec.simple('|')
});

// Or via DI
GasDI.Root.registerValue('dataStore', myStore);
GasDI.Root.registerValue('keyCodec', myCodec);
```

### EventSystem Module

**DI-Enabled Components**:
- `JobStore`: Job persistence (mandatory)
- `GlobalInvoker`: Function execution (mandatory)
- `Logger`: Logging (optional)
- `Clock`: Time operations (optional)

### GasDI Module

**Self-contained**: GasDI itself doesn't require DI as it IS the DI system.

### Locking Module

**DI-Enabled Components**:
- `LockService`: Lock provider (mandatory)
- `Logger`: Logging (optional)

## Best Practices

### 1. Use Global Container for Application-Level Dependencies

```typescript
// ✅ Good: Application-level services in global container
function setupApplication() {
    GasDI.Root.registerValue('logger', createLogger());
    GasDI.Root.registerValue('config', loadConfig());
}

// ❌ Bad: Creating new containers everywhere
function myFunction() {
    const container = new GasDI.Container(); // Don't create multiple containers
    container.registerValue('logger', new Logger());
}
```

### 2. Register Dependencies at Application Startup

```typescript
// ✅ Good: Centralized initialization
function onOpen() {
    initializeServices();
}

function initializeServices() {
    // Register all services once
    GasDI.Root.registerValue('logger', RestFramework.Logger.create());
    GasDI.Root.registerValue('authService', new AuthService());
    GasDI.Root.registerValue('requestValidator', new RequestValidator());
}

// ❌ Bad: Registering in multiple places
function handleRequest() {
    GasDI.Root.registerValue('logger', new Logger()); // Don't register per request
}
```

### 3. Use Optional Resolution for Truly Optional Services

```typescript
// ✅ Good: Optional services with fallback
const logger = GasDI.Root.resolve('logger', { optional: true }) || createDefaultLogger();

// ✅ Good: Check if service exists
const authService = GasDI.Root.resolve('authService', { optional: true });
if (authService) {
    authService.authenticate(token);
}

// ❌ Bad: Required services as optional (will fail silently)
const requestMapper = GasDI.Root.resolve('requestMapper', { optional: true }); // Should be mandatory!
```

### 4. Choose Appropriate Lifetimes

```typescript
// ✅ Good: Singleton for stateless services
GasDI.Root.registerFactory('logger', () => new Logger(), 'singleton');

// ✅ Good: Scoped for request-specific data
requestScope.registerFactory('requestId', () => generateId(), 'scoped');

// ✅ Good: Transient for stateful operations
container.registerFactory('validator', () => new Validator(), 'transient');

// ❌ Bad: Singleton for stateful objects (causes bugs)
container.registerFactory('requestContext', () => new RequestContext(), 'singleton');
```

### 5. Use Typed Tokens for Type Safety

```typescript
// ✅ Good: Type-safe tokens
interface AppConfig {
    apiUrl: string;
}

const CONFIG_TOKEN = 'config' as GasDI.Ports.Token<AppConfig>;
GasDI.Root.registerValue(CONFIG_TOKEN, { apiUrl: 'https://api.example.com' });
const config: AppConfig = GasDI.Root.resolve(CONFIG_TOKEN);

// ❌ Bad: Untyped strings (loses type safety)
const config = GasDI.Root.resolve('config'); // Type is 'any'
```

## Common Patterns

### Pattern 1: Service Locator for Optional Features

```typescript
class MyController {
    private logger?: Shared.Types.Logger;
    
    constructor() {
        // Locate optional logger service
        this.logger = GasDI.Root.resolve('logger', { optional: true });
    }
    
    execute() {
        this.logger?.info('Executing controller');
        // Main logic doesn't depend on logger
    }
}
```

### Pattern 2: Scoped Container for Request Handling

```typescript
function handleRequest(e: any) {
    // Create request-scoped container
    const requestScope = GasDI.Root.createScope('request');
    
    // Register request-specific data
    requestScope.registerValue('requestId', generateRequestId());
    requestScope.registerValue('currentUser', extractUser(e));
    
    // Use scoped dependencies
    const controller = new MyController(requestScope);
    return controller.handle(e);
}
```

### Pattern 3: Factory Pattern with DI

```typescript
// Factory registered in DI
GasDI.Root.registerFactory('userRepository', () => {
    const store = GasDI.Root.resolve('dataStore');
    const logger = GasDI.Root.resolve('logger', { optional: true });
    
    return Repository.Engine.create({
        schema: userSchema,
        store: store,
        keyCodec: Repository.Codec.simple('|'),
        logger: logger
    });
}, 'singleton');

// Usage
const userRepo = GasDI.Root.resolve('userRepository');
```

## Testing with DI

### Mocking Dependencies in Tests

```typescript
describe('MyController', () => {
    beforeEach(() => {
        // Register test doubles
        GasDI.Root.registerValue('logger', {
            info: jest.fn(),
            error: jest.fn()
        });
        
        GasDI.Root.registerValue('authService', {
            authenticate: jest.fn(() => ({ isAuthenticated: true, user: { id: 'test' } })),
            authorize: jest.fn(() => true)
        });
    });
    
    afterEach(() => {
        // Clean up (if needed)
        // Note: GasDI doesn't have built-in cleanup, so consider test isolation strategies
    });
    
    it('should use injected services', () => {
        const controller = new MyController();
        controller.execute();
        
        const logger = GasDI.Root.resolve('logger');
        expect(logger.info).toHaveBeenCalled();
    });
});
```

### Test Isolation

```typescript
// Option 1: Use separate containers for tests
describe('MyTest', () => {
    let testContainer: GasDI.Container;
    
    beforeEach(() => {
        testContainer = new GasDI.Container();
        testContainer.registerValue('logger', mockLogger);
    });
});

// Option 2: Reset global container (use with caution)
describe('MyTest', () => {
    const originalServices = {};
    
    beforeAll(() => {
        // Save original registrations if needed
    });
    
    afterAll(() => {
        // Restore original registrations
    });
});
```

## Summary

**Key Takeaways**:

1. **Mandatory components** are passed directly; **optional components** use DI
2. Use **GasDI.Root** for application-level dependencies
3. Register services **once at startup**, not per request
4. Use **optional resolution** (`{ optional: true }`) for truly optional services
5. Choose appropriate **lifetimes** (singleton, scoped, transient)
6. Use **typed tokens** for compile-time type safety
7. **Test with mocks** by registering test doubles in DI container

**Related Documentation**:
- [GasDI Module README](src/Modules/GasDI/README.md)
- [RestFramework Optional Utilities](src/RestFramework/optional-utilities/README.md)
- [RestFramework Examples](src/RestFramework/examples/README.md)

**Need Help?**
- Check the [GasDI tests](test/Modules/GasDI/) for usage examples
- Review [RestFramework tests](test_node/restframework/) for DI patterns
- See individual module READMEs for module-specific DI patterns
