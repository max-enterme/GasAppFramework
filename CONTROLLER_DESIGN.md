# Controller Design Guide for RestFramework

This document provides best practices and patterns for designing thin, maintainable controllers in the RestFramework. The goal is to prevent controller responsibility bloat and maintain a clean separation of concerns.

## Table of Contents

1. [Thin Controller Philosophy](#thin-controller-philosophy)
2. [Controller Responsibilities](#controller-responsibilities)
3. [Separation of Concerns](#separation-of-concerns)
4. [Using Middleware for Cross-Cutting Concerns](#using-middleware-for-cross-cutting-concerns)
5. [Input Validation Patterns](#input-validation-patterns)
6. [Examples and Anti-Patterns](#examples-and-anti-patterns)
7. [Testing Thin Controllers](#testing-thin-controllers)

## Thin Controller Philosophy

**Principle**: Controllers should be thin orchestrators, not business logic implementers.

A controller's role is to:
- Coordinate the request/response flow
- Delegate to appropriate components
- Not contain business logic
- Not directly access data stores
- Not perform complex calculations

**Analogy**: Think of a controller as a restaurant maître d' - they greet customers, take orders, and coordinate with the kitchen and servers, but they don't cook the food themselves.

## Controller Responsibilities

### ✅ What Controllers SHOULD Do

1. **Request Coordination**
   ```typescript
   handle(rawRequest: any): ApiResponse<any> {
       // Coordinate the flow, but delegate the work
       return this.processRequest(rawRequest);
   }
   ```

2. **Component Wiring**
   ```typescript
   constructor() {
       super(
           new RequestMapper(),    // Delegate input mapping
           new ResponseMapper(),   // Delegate output mapping
           new BusinessLogic()     // Delegate business rules
       );
   }
   ```

3. **Error Boundary**
   ```typescript
   try {
       return this.processRequest(rawRequest);
   } catch (error) {
       return this._errorHandler.handle(error);
   }
   ```

### ❌ What Controllers SHOULD NOT Do

1. **Business Logic**
   ```typescript
   // ❌ BAD: Business logic in controller
   execute(request: UserRequest): UserResponse {
       if (request.age < 18) {
           throw new Error('User must be 18 or older');
       }
       // Complex business rules...
   }
   ```

2. **Direct Data Access**
   ```typescript
   // ❌ BAD: Direct spreadsheet access in controller
   execute(request: UserRequest): UserResponse {
       const sheet = SpreadsheetApp.openById('...');
       const data = sheet.getRange('A1:Z100').getValues();
       // ...
   }
   ```

3. **Complex Transformations**
   ```typescript
   // ❌ BAD: Complex data transformation in controller
   execute(request: UserRequest): UserResponse {
       const transformed = request.items.map(item => ({
           ...item,
           calculated: this.complexCalculation(item),
           formatted: this.formatData(item)
       }));
       // ...
   }
   ```

## Separation of Concerns

### Layer Responsibilities

```
┌─────────────────────────────────────┐
│ Controller (Orchestration)          │
│ - Coordinates request flow          │
│ - Wires components together         │
│ - Handles errors at boundary        │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│ Middleware (Cross-cutting)          │
│ - Logging                           │
│ - Authentication                    │
│ - Rate limiting                     │
│ - Request preprocessing             │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│ Mappers (Transformation)            │
│ - Request mapping                   │
│ - Response mapping                  │
│ - Data format conversion            │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│ Validators (Input Validation)       │
│ - Schema validation                 │
│ - Business rule validation          │
│ - Data integrity checks             │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│ Business Logic (Domain Rules)       │
│ - Core business operations          │
│ - Domain-specific calculations      │
│ - Use case implementation           │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│ Services (Infrastructure)           │
│ - Repository operations             │
│ - External API calls                │
│ - File system access                │
└─────────────────────────────────────┘
```

### Implementation Pattern

```typescript
// ✅ GOOD: Each layer has clear responsibilities

// 1. Mapper: Transform input
class UserRequestMapper implements RestFramework.Types.RequestMapper<any, UserRequest> {
    map(input: any): UserRequest {
        return {
            id: input.parameter?.id || '',
            name: input.parameter?.name || '',
            email: input.parameter?.email || ''
        };
    }
}

// 2. Validator: Check input rules (optional, via DI)
class UserRequestValidator implements RestFramework.Types.RequestValidator<UserRequest> {
    validate(request: UserRequest): { isValid: boolean; errors?: string[] } {
        const errors: string[] = [];
        if (!request.id) errors.push('ID is required');
        if (request.email && !this.isValidEmail(request.email)) {
            errors.push('Invalid email format');
        }
        return { isValid: errors.length === 0, errors };
    }
    
    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// 3. Service: Handle data operations
class UserService {
    constructor(private repository: any) {}
    
    findUser(id: string): User | null {
        return this.repository.findById(id);
    }
    
    updateUser(user: User): User {
        return this.repository.save(user);
    }
}

// 4. Business Logic: Implement domain rules
class UserApiLogic implements RestFramework.Types.ApiLogic<UserRequest, UserResponse> {
    constructor(private userService: UserService) {}
    
    execute(request: UserRequest): UserResponse {
        // Delegate to service
        const user = this.userService.findUser(request.id);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Apply business rules
        if (request.name && request.name !== user.name) {
            user.name = request.name;
            this.userService.updateUser(user);
        }
        
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            updatedAt: new Date().toISOString()
        };
    }
}

// 5. Response Mapper: Transform output
class UserResponseMapper implements RestFramework.Types.ResponseMapper<UserResponse, any> {
    map(input: UserResponse): any {
        return {
            user: {
                id: input.id,
                name: input.name,
                email: input.email,
                updated_at: input.updatedAt
            }
        };
    }
}

// 6. Controller: Orchestrate (stays thin!)
class UserController extends RestFramework.ApiController<UserRequest, UserResponse> {
    constructor() {
        const userService = new UserService(myRepository);
        
        super(
            new UserRequestMapper(),
            new UserResponseMapper(),
            new UserApiLogic(userService),
            GasDI.Root.resolve('requestValidator', { optional: true }),
            GasDI.Root.resolve('authService', { optional: true }),
            GasDI.Root.resolve('middlewareManager', { optional: true })
        );
    }
}
```

## Using Middleware for Cross-Cutting Concerns

Middleware is ideal for concerns that apply across multiple controllers.

### Common Middleware Use Cases

1. **Request Logging**
2. **Authentication/Authorization**
3. **Rate Limiting**
4. **Input Sanitization**
5. **Response Caching**
6. **CORS Headers**
7. **Request ID Generation**

### Middleware Implementation

```typescript
class ApiMiddlewareManager implements RestFramework.Types.MiddlewareManager {
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

// Setup middleware pipeline
const middlewareManager = new ApiMiddlewareManager();

// 1. Logging middleware
middlewareManager.use((context, next) => {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] ${context.method} ${context.path || 'unknown'}`);
    
    const result = next();
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Response sent (${duration}ms)`);
    
    return result;
});

// 2. Request ID middleware
middlewareManager.use((context, next) => {
    context.requestId = Utilities.getUuid();
    return next();
});

// 3. Rate limiting middleware
middlewareManager.use((context, next) => {
    const clientId = context.headers?.['x-client-id'] || 'anonymous';
    
    if (isRateLimited(clientId)) {
        throw new Error('Rate limit exceeded');
    }
    
    return next();
});

// Register with DI
GasDI.Root.registerValue('middlewareManager', middlewareManager);
```

## Input Validation Patterns

### Pattern 1: Validation via Optional Utility

Move validation logic out of controllers into dedicated validators:

```typescript
// ✅ GOOD: Dedicated validator
class ProductRequestValidator implements RestFramework.Types.RequestValidator<ProductRequest> {
    validate(request: ProductRequest): { isValid: boolean; errors?: string[] } {
        const errors: string[] = [];
        
        // Basic validation
        if (!request.productId) {
            errors.push('Product ID is required');
        }
        
        // Business rule validation
        if (request.price !== undefined && request.price < 0) {
            errors.push('Price cannot be negative');
        }
        
        if (request.quantity !== undefined && request.quantity < 0) {
            errors.push('Quantity cannot be negative');
        }
        
        // Format validation
        if (request.productId && !/^[A-Z]{3}\d{6}$/.test(request.productId)) {
            errors.push('Product ID must be in format: ABC123456');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}

// Register validator
GasDI.Root.registerValue('requestValidator', new ProductRequestValidator());

// Controller automatically uses it
class ProductController extends RestFramework.ApiController<ProductRequest, ProductResponse> {
    constructor() {
        super(
            new ProductRequestMapper(),
            new ProductResponseMapper(),
            new ProductApiLogic(),
            GasDI.Root.resolve('requestValidator', { optional: true }) // Validation handled here
        );
    }
}
```

### Pattern 2: Validation via Middleware

For validation that applies across multiple controllers:

```typescript
// Validation middleware
const validationMiddleware = (context: any, next: () => any) => {
    // Common validation rules that apply to all requests
    if (!context.parameter?.version) {
        throw new Error('API version parameter is required');
    }
    
    if (context.parameter.version !== 'v1') {
        throw new Error('Unsupported API version');
    }
    
    return next();
};

middlewareManager.use(validationMiddleware);
```

### Pattern 3: Schema-Based Validation

Use schema validators for complex validation:

```typescript
class SchemaValidator<T> implements RestFramework.Types.RequestValidator<T> {
    constructor(private schema: any) {}
    
    validate(request: T): { isValid: boolean; errors?: string[] } {
        const errors: string[] = [];
        
        // Validate against schema
        for (const [field, rules] of Object.entries(this.schema)) {
            const value = (request as any)[field];
            const fieldRules = rules as any;
            
            if (fieldRules.required && !value) {
                errors.push(`${field} is required`);
            }
            
            if (value && fieldRules.type) {
                if (typeof value !== fieldRules.type) {
                    errors.push(`${field} must be of type ${fieldRules.type}`);
                }
            }
            
            if (value && fieldRules.pattern) {
                if (!new RegExp(fieldRules.pattern).test(value)) {
                    errors.push(`${field} format is invalid`);
                }
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}

// Usage
const userSchema = {
    id: { required: true, type: 'string', pattern: '^[A-Z0-9]+$' },
    email: { required: false, type: 'string', pattern: '^[^@]+@[^@]+\\.[^@]+$' },
    age: { required: false, type: 'number' }
};

GasDI.Root.registerValue('requestValidator', new SchemaValidator(userSchema));
```

## Examples and Anti-Patterns

### Example 1: Good - Thin Controller

```typescript
// ✅ Thin controller with clear separation
class OrderController extends RestFramework.ApiController<OrderRequest, OrderResponse> {
    constructor() {
        const orderService = GasDI.Root.resolve('orderService');
        
        super(
            new OrderRequestMapper(),
            new OrderResponseMapper(),
            new OrderApiLogic(orderService), // Business logic delegated
            GasDI.Root.resolve('requestValidator', { optional: true }),
            GasDI.Root.resolve('authService', { optional: true }),
            GasDI.Root.resolve('middlewareManager', { optional: true })
        );
    }
}

class OrderApiLogic implements RestFramework.Types.ApiLogic<OrderRequest, OrderResponse> {
    constructor(private orderService: OrderService) {}
    
    execute(request: OrderRequest): OrderResponse {
        // Delegate to service layer
        const order = this.orderService.processOrder(request);
        return this.orderService.toResponse(order);
    }
}
```

### Anti-Pattern 1: Fat Controller

```typescript
// ❌ BAD: Controller doing too much
class OrderController extends RestFramework.ApiController<OrderRequest, OrderResponse> {
    // ...
}

class OrderApiLogic implements RestFramework.Types.ApiLogic<OrderRequest, OrderResponse> {
    execute(request: OrderRequest): OrderResponse {
        // ❌ Direct data access
        const sheet = SpreadsheetApp.openById('...');
        const orders = sheet.getRange('A2:F100').getValues();
        
        // ❌ Complex business logic
        const customerOrders = orders.filter(row => row[1] === request.customerId);
        const totalAmount = customerOrders.reduce((sum, row) => sum + row[4], 0);
        
        if (totalAmount > 10000) {
            // Apply discount
            request.price = request.price * 0.9;
        }
        
        // ❌ Direct external API calls
        const response = UrlFetchApp.fetch('https://api.external.com/validate');
        
        // ❌ Complex calculations
        const tax = this.calculateTax(request);
        const shipping = this.calculateShipping(request);
        
        // Too much logic here!
        return { /* ... */ };
    }
}
```

### Example 2: Middleware for Input Sanitization

```typescript
// ✅ GOOD: Input sanitization in middleware
const sanitizationMiddleware = (context: any, next: () => any) => {
    // Sanitize common inputs
    if (context.parameter) {
        Object.keys(context.parameter).forEach(key => {
            const value = context.parameter[key];
            if (typeof value === 'string') {
                // Remove potentially harmful characters
                context.parameter[key] = value
                    .replace(/<script[^>]*>.*?<\/script>/gi, '')
                    .replace(/<[^>]+>/g, '')
                    .trim();
            }
        });
    }
    
    return next();
};

middlewareManager.use(sanitizationMiddleware);
```

## Testing Thin Controllers

Thin controllers are easier to test because they have fewer dependencies and responsibilities.

### Testing Strategy

```typescript
describe('OrderController', () => {
    let mockOrderService: any;
    let orderLogic: OrderApiLogic;
    
    beforeEach(() => {
        // Mock service layer
        mockOrderService = {
            processOrder: jest.fn(),
            toResponse: jest.fn()
        };
        
        orderLogic = new OrderApiLogic(mockOrderService);
    });
    
    it('should delegate to order service', () => {
        const request: OrderRequest = {
            orderId: 'ORD123',
            customerId: 'CUST456'
        };
        
        const mockOrder = { id: 'ORD123', status: 'processed' };
        mockOrderService.processOrder.mockReturnValue(mockOrder);
        mockOrderService.toResponse.mockReturnValue({
            orderId: 'ORD123',
            status: 'processed'
        });
        
        const result = orderLogic.execute(request);
        
        expect(mockOrderService.processOrder).toHaveBeenCalledWith(request);
        expect(mockOrderService.toResponse).toHaveBeenCalledWith(mockOrder);
        expect(result.orderId).toBe('ORD123');
    });
});
```

### Testing Middleware

```typescript
describe('Middleware', () => {
    it('should sanitize input', () => {
        const context = {
            parameter: {
                name: '<script>alert("xss")</script>John',
                email: 'john@example.com'
            }
        };
        
        let nextCalled = false;
        const next = () => { nextCalled = true; return {}; };
        
        sanitizationMiddleware(context, next);
        
        expect(context.parameter.name).toBe('John');
        expect(context.parameter.email).toBe('john@example.com');
        expect(nextCalled).toBe(true);
    });
});
```

## Summary

**Key Principles for Thin Controllers:**

1. ✅ **Delegate, Don't Implement**: Controllers coordinate, they don't do the work
2. ✅ **Single Responsibility**: Each layer has one clear purpose
3. ✅ **Use Middleware**: Cross-cutting concerns belong in middleware
4. ✅ **Separate Validation**: Use validators or middleware, not controller logic
5. ✅ **Test Independently**: Each layer should be testable in isolation
6. ✅ **Dependency Injection**: Use DI for optional and cross-cutting services

**Remember**: A thin controller is a sign of good architecture. If your controller or ApiLogic is more than 20-30 lines, consider extracting logic into services, validators, or middleware.

**Related Documentation**:
- [RestFramework README](src/RestFramework/README.md)
- [Optional Utilities Guide](src/RestFramework/optional-utilities/README.md)
- [Dependency Injection Guide](DEPENDENCY_INJECTION.md)
- [Examples Directory](src/RestFramework/examples/README.md)
