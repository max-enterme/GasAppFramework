# RestFramework Examples

This directory contains practical, working examples demonstrating how to use the RestFramework in real-world scenarios.

## Overview

The examples here showcase complete implementations that you can use as templates for your own API endpoints. Each example demonstrates different aspects of the framework and best practices.

## Available Examples

### UserController.ts

A comprehensive example demonstrating a complete user management API endpoint.

**Features Demonstrated:**
- Request mapping from GAS events to typed requests
- Response mapping from business logic to API format
- Business logic implementation
- GAS entry point functions (doGet, doPost)
- Namespace organization
- Type safety with TypeScript

**When to Use This Pattern:**
- Building CRUD APIs in Google Apps Script
- Need for structured request/response handling
- Want to maintain separation of concerns
- Implementing RESTful patterns in GAS

## Usage Scenarios

### Scenario 1: Simple GET API

**Use Case:** Fetch user data by ID

```typescript
// Based on UserController example
// GET request: ?id=user123

// In Google Apps Script:
function doGet(e: GoogleAppsScript.Events.DoGet) {
    return RestFramework.Examples.doGet(e);
}

// Response:
{
    "success": true,
    "data": {
        "user": {
            "id": "user123",
            "name": "Unknown User",
            "email": "unknown@example.com",
            "created_at": "2024-01-01T12:00:00.000Z"
        }
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Scenario 2: POST API with JSON Body

**Use Case:** Create or update user data

```typescript
// Based on UserController example
// POST request with JSON body:
// {
//     "id": "user123",
//     "name": "John Doe",
//     "email": "john@example.com"
// }

function doPost(e: GoogleAppsScript.Events.DoPost) {
    return RestFramework.Examples.doPost(e);
}

// Response:
{
    "success": true,
    "data": {
        "user": {
            "id": "user123",
            "name": "John Doe",
            "email": "john@example.com",
            "created_at": "2024-01-01T12:00:00.000Z"
        }
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Scenario 3: Error Handling

**Use Case:** Invalid request handling

```typescript
// GET request: ?id= (empty ID)

// Automatic error response:
{
    "success": false,
    "error": {
        "code": "ValidationError",
        "message": "Invalid user ID",
        "details": {}
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Adapting Examples for Your Use Case

### Step 1: Define Your Data Model

```typescript
// Define your request/response types
interface ProductRequest {
    productId: string;
    name?: string;
    price?: number;
    quantity?: number;
}

interface ProductResponse {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    lastUpdated: string;
}
```

### Step 2: Implement Mappers

```typescript
// Map GAS request to your domain
class ProductRequestMapper implements RestFramework.Types.RequestMapper<any, ProductRequest> {
    map(input: any): ProductRequest {
        return {
            productId: input.productId || input.parameter?.productId || '',
            name: input.name || input.parameter?.name,
            price: input.price || input.parameter?.price ? parseFloat(input.parameter.price) : undefined,
            quantity: input.quantity || input.parameter?.quantity ? parseInt(input.parameter.quantity) : undefined
        };
    }
}

// Map your domain to API response
class ProductResponseMapper implements RestFramework.Types.ResponseMapper<ProductResponse, any> {
    map(input: ProductResponse): any {
        return {
            product: {
                id: input.productId,
                name: input.name,
                price: input.price,
                quantity: input.quantity,
                last_updated: input.lastUpdated
            }
        };
    }
}
```

### Step 3: Implement Business Logic

```typescript
class ProductApiLogic implements RestFramework.Types.ApiLogic<ProductRequest, ProductResponse> {
    execute(request: ProductRequest): ProductResponse {
        // Validate input
        if (!request.productId) {
            throw new Error('Product ID is required');
        }

        // Your business logic here
        // - Database operations
        // - External API calls
        // - Data processing
        
        return {
            productId: request.productId,
            name: request.name || 'Unknown Product',
            price: request.price || 0,
            quantity: request.quantity || 0,
            lastUpdated: new Date().toISOString()
        };
    }
}
```

### Step 4: Create Your Controller

```typescript
export class ProductController extends RestFramework.ApiController<ProductRequest, ProductResponse> {
    private constructor() {
        super(
            new ProductRequestMapper(),
            new ProductResponseMapper(),
            new ProductApiLogic()
        );
    }

    static handleRequest(request: any): RestFramework.Types.ApiResponse<any> {
        const controller = new ProductController();
        return controller.handle(request);
    }
}
```

### Step 5: Set Up GAS Entry Points

```typescript
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
    const response = ProductController.handleRequest({
        method: 'GET',
        parameter: e.parameter,
        parameters: e.parameters
    });

    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
    let body = {};
    try {
        body = e.postData?.contents ? JSON.parse(e.postData.contents) : {};
    } catch (error) {
        // Handle JSON parse error
    }

    const response = ProductController.handleRequest({
        method: 'POST',
        parameter: e.parameter,
        parameters: e.parameters,
        body: body
    });

    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}
```

## Advanced Patterns

### Using Optional Utilities

For more complex scenarios, integrate optional utilities:

```typescript
// With validation, auth, and middleware
export class SecureProductController extends RestFramework.ApiController<ProductRequest, ProductResponse> {
    private constructor() {
        super(
            new ProductRequestMapper(),
            new ProductResponseMapper(),
            new ProductApiLogic(),
            GasDI.Root.resolve('requestValidator', { optional: true }), // Validation
            GasDI.Root.resolve('authService', { optional: true }),       // Authentication
            GasDI.Root.resolve('middlewareManager', { optional: true }), // Middleware
            GasDI.Root.resolve('logger', { optional: true }),            // Logging
            GasDI.Root.resolve('errorHandler', { optional: true })       // Error handling
        );
    }
}
```

See [Optional Utilities README](../optional-utilities/README.md) for detailed documentation on these components.

### Thin Controller Pattern

Keep controllers thin by delegating responsibilities:

**✅ Good - Thin Controller:**
```typescript
class UserApiLogic implements RestFramework.Types.ApiLogic<UserRequest, UserResponse> {
    constructor(
        private userService: UserService,
        private validator: UserValidator
    ) {}

    execute(request: UserRequest): UserResponse {
        // All business logic is in services
        const user = this.userService.findById(request.id);
        return this.userService.toResponse(user);
    }
}
```

**❌ Bad - Fat Controller:**
```typescript
// Don't do this in ApiLogic or Controller
execute(request: UserRequest): UserResponse {
    // Too much logic in controller layer
    const sheet = SpreadsheetApp.openById('...');
    const data = sheet.getRange('A1:Z100').getValues();
    const filtered = data.filter(row => row[0] === request.id);
    // ... more direct implementation details
}
```

## Testing Your Implementation

Based on the examples, you can test your controllers:

```typescript
// test_node/your-controller.test.ts
import { ProductController } from '../src/RestFramework/examples/ProductController';

describe('ProductController', () => {
    it('should handle GET requests', () => {
        const response = ProductController.handleRequest({
            method: 'GET',
            parameter: { productId: 'prod123' }
        });

        expect(response.success).toBe(true);
        expect(response.data.product.id).toBe('prod123');
    });

    it('should handle validation errors', () => {
        const response = ProductController.handleRequest({
            method: 'GET',
            parameter: { productId: '' }
        });

        expect(response.success).toBe(false);
        expect(response.error?.code).toBe('ValidationError');
    });
});
```

## Best Practices Demonstrated

1. **Separation of Concerns**: Each component (mapper, logic, controller) has a single responsibility
2. **Type Safety**: Strong typing throughout the request/response pipeline
3. **Error Handling**: Consistent error responses through the framework
4. **Reusability**: Components can be reused across different endpoints
5. **Testability**: Pure functions and dependency injection enable easy testing
6. **GAS Compatibility**: Namespace organization works seamlessly in GAS environment

## Common Pitfalls to Avoid

1. **❌ Don't Mix Concerns**: Keep validation, business logic, and data access separate
2. **❌ Don't Bypass Mappers**: Always use mappers to transform data
3. **❌ Don't Return Raw Errors**: Let the ErrorHandler format error responses
4. **❌ Don't Use Async in GAS**: GAS doesn't support promises well; use synchronous code
5. **❌ Don't Ignore Type Safety**: Leverage TypeScript's type system

## Next Steps

1. Copy an example and adapt it to your use case
2. Review [Optional Utilities](../optional-utilities/README.md) for advanced features
3. Read [Dependency Injection Guide](../../../DEPENDENCY_INJECTION.md) for DI patterns
4. Check [Main RestFramework README](../README.md) for complete API reference

## Questions?

- See complete API documentation in [RestFramework README](../README.md)
- Check [GasDI Module](../../Modules/GasDI/README.md) for dependency injection
- Review [Best Practices](../README.md#best-practices) section
- Look at test examples in `test_node/restframework/` directory
