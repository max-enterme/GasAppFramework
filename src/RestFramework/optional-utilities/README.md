# Optional Utilities for RestFramework

This directory contains **optional components** that can be used to extend the base functionality of the RestFramework. These utilities are not required for basic operation but provide additional features for advanced use cases.

## Components Overview

### RequestValidator
Provides request validation capabilities to ensure incoming data meets expected criteria before processing.

**Use Case:**
- Input validation before business logic execution
- Data type and format checking
- Required field validation

**Example:**
```typescript
class UserRequestValidator implements RestFramework.Types.RequestValidator<UserRequest> {
    validate(request: UserRequest): { isValid: boolean; errors?: string[] } {
        const errors: string[] = [];
        
        if (!request.id || request.id.trim() === '') {
            errors.push('User ID is required');
        }
        
        if (request.email && !this.isValidEmail(request.email)) {
            errors.push('Invalid email format');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
    
    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// Register with dependency injection
GasDI.Root.registerValue('requestValidator', new UserRequestValidator());
```

### AuthService
Handles authentication and authorization for API endpoints.

**Use Case:**
- Token-based authentication
- User identity verification
- Resource-level authorization checks
- Role-based access control

**Example:**
```typescript
class JwtAuthService implements RestFramework.Types.AuthService {
    authenticate(token?: string): { isAuthenticated: boolean; user?: any } {
        if (!token) {
            return { isAuthenticated: false };
        }
        
        try {
            const decoded = this.verifyToken(token);
            return {
                isAuthenticated: true,
                user: decoded
            };
        } catch (error) {
            return { isAuthenticated: false };
        }
    }
    
    authorize(user: any, resource: string, action: string): boolean {
        // Check user permissions
        return user.permissions?.includes(`${resource}:${action}`) || false;
    }
    
    private verifyToken(token: string): any {
        // Verify JWT token (implementation depends on your auth strategy)
        return {}; // Decoded token payload
    }
}

// Register with dependency injection
GasDI.Root.registerValue('authService', new JwtAuthService());
```

### MiddlewareManager
Manages middleware execution pipeline for cross-cutting concerns.

**Use Case:**
- Request/response transformation
- Logging and monitoring
- Rate limiting
- CORS handling
- Request preprocessing

**Example:**
```typescript
class SimpleMiddlewareManager implements RestFramework.Types.MiddlewareManager {
    private middlewares: Array<(context: any, next: () => any) => any> = [];
    
    use(middleware: (context: any, next: () => any) => any): void {
        this.middlewares.push(middleware);
    }
    
    execute(context: any, next: () => any): any {
        let index = 0;
        
        const runNext = (): any => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index++];
                return middleware(context, runNext);
            }
            return next();
        };
        
        return runNext();
    }
}

// Example middleware: Request logging
const loggingMiddleware = (context: any, next: () => any) => {
    console.log(`[${new Date().toISOString()}] ${context.method} ${context.path}`);
    const result = next();
    console.log(`[${new Date().toISOString()}] Response sent`);
    return result;
};

// Example middleware: Rate limiting
const rateLimitMiddleware = (context: any, next: () => any) => {
    const clientId = context.headers?.['x-client-id'];
    if (this.isRateLimited(clientId)) {
        throw new Error('Rate limit exceeded');
    }
    return next();
};

// Setup
const middlewareManager = new SimpleMiddlewareManager();
middlewareManager.use(loggingMiddleware);
middlewareManager.use(rateLimitMiddleware);

GasDI.Root.registerValue('middlewareManager', middlewareManager);
```

## Integration with Controllers

Optional utilities are injected into controllers through the constructor or via dependency injection:

```typescript
@GasDI.Decorators.Resolve()
class SecureUserController extends RestFramework.ApiController<UserRequest, UserResponse> {
    constructor() {
        super(
            new UserRequestMapper(),
            new UserResponseMapper(),
            new UserApiLogic(),
            GasDI.Root.resolve('requestValidator', { optional: true }),
            GasDI.Root.resolve('authService', { optional: true }),
            GasDI.Root.resolve('middlewareManager', { optional: true }),
            GasDI.Root.resolve('logger', { optional: true }),
            GasDI.Root.resolve('errorHandler', { optional: true })
        );
    }
}
```

## When to Use Optional Utilities

### Use RequestValidator when:
- Input data requires complex validation rules
- You need to provide detailed validation error messages
- You want to separate validation logic from business logic

### Use AuthService when:
- Your API requires authentication
- You need role-based access control
- You want centralized authorization logic

### Use MiddlewareManager when:
- You have cross-cutting concerns (logging, monitoring, rate limiting)
- You need to preprocess requests before they reach the controller
- You want to implement a plugin-style architecture

## Best Practices

1. **Keep optional utilities truly optional**: The framework should work without them
2. **Use dependency injection**: Register utilities with GasDI for loose coupling
3. **Implement single responsibility**: Each utility should have one clear purpose
4. **Test independently**: Write unit tests for each utility in isolation
5. **Document clearly**: Provide clear examples and usage guidelines

## Differences from Mandatory Components

| Aspect | Mandatory Components | Optional Utilities |
|--------|---------------------|-------------------|
| Location | `interfaces/` | `optional-utilities/` |
| Required | Yes, for controller operation | No, controllers work without them |
| Examples | RequestMapper, ResponseMapper, ApiLogic | RequestValidator, AuthService, MiddlewareManager |
| DI Pattern | Provided directly in constructor | Resolved optionally via DI |
| Purpose | Core framework functionality | Extended features and cross-cutting concerns |

## Related Documentation

- [Main RestFramework README](../README.md)
- [Examples Directory](../examples/README.md)
- [Dependency Injection Guide](../../../DEPENDENCY_INJECTION.md)
- [Controller Best Practices](../README.md#best-practices)
