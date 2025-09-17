# API Framework for GAS App Framework

This framework provides a standardized foundation for building REST API-style applications in Google Apps Script (GAS) environments.

## Overview

The Framework module follows the established GasAppFramework patterns and provides:

- **BaseApiController**: Abstract base class for API endpoints
- **Standardized Response Format**: Consistent API responses across all endpoints
- **Error Handling**: Centralized error processing and logging
- **Dependency Injection**: Optional services injected via GasDI
- **Type Safety**: Full TypeScript support with interfaces

## Architecture

```
Framework/
├── controllers/           # Base controller classes
│   └── BaseApiController.ts
├── formatters/           # Response formatting
│   └── ApiResponseFormatter.ts
├── errors/              # Error handling
│   └── ErrorHandler.ts
├── logging/             # Framework logging
│   └── Logger.ts
├── interfaces/          # Core interfaces
│   ├── IRequestMapper.ts
│   ├── IResponseMapper.ts
│   ├── IApiLogic.ts
│   ├── IRequestValidator.ts    # Optional
│   ├── IAuthService.ts         # Optional
│   └── IMiddlewareManager.ts   # Optional
├── examples/            # Sample implementations
│   └── UserController.ts
└── Core.Types.d.ts     # Type definitions
```

## Quick Start

### 1. Define Your Types

```typescript
interface MyRequest {
    id: string;
    name: string;
}

interface MyResponse {
    id: string;
    name: string;
    status: string;
}
```

### 2. Implement Required Components

```typescript
// Request Mapper
class MyRequestMapper implements Framework.Types.IRequestMapper<any, MyRequest> {
    map(input: any): MyRequest {
        return {
            id: input.parameter?.id || '',
            name: input.parameter?.name || ''
        };
    }
}

// Response Mapper
class MyResponseMapper implements Framework.Types.IResponseMapper<MyResponse, any> {
    map(input: MyResponse): any {
        return {
            item: {
                id: input.id,
                name: input.name,
                status: input.status
            }
        };
    }
}

// Business Logic
class MyApiLogic implements Framework.Types.IApiLogic<MyRequest, MyResponse> {
    execute(request: MyRequest): MyResponse {
        // Your business logic here
        return {
            id: request.id,
            name: request.name,
            status: 'processed'
        };
    }
}
```

### 3. Create Your Controller

```typescript
@GasDI.Decorators.Resolve()
class MyController extends Framework.BaseApiController<MyRequest, MyResponse> {
    protected readonly requestMapper = new MyRequestMapper();
    protected readonly responseMapper = new MyResponseMapper();
    protected readonly apiLogic = new MyApiLogic();
}
```

### 4. GAS Entry Points

```typescript
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
    const controller = new MyController();
    const response = controller.handle({
        method: 'GET',
        parameter: e.parameter
    });

    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}
```

## Dependency Injection (Optional Features)

The framework supports optional services through GasDI:

### Request Validation

```typescript
// Register a validator
GasDI.Root.registerValue('requestValidator', {
    validate: (request: MyRequest) => ({
        isValid: !!request.id,
        errors: request.id ? [] : ['ID is required']
    })
});
```

### Authentication

```typescript
// Register auth service
GasDI.Root.registerValue('authService', {
    authenticate: (token?: string) => ({
        isAuthenticated: !!token,
        user: token ? { id: 'user1' } : null
    }),
    authorize: (user: any, resource: string, action: string) => true
});
```

### Custom Logging

```typescript
// Register custom logger
GasDI.Root.registerValue('logger', Framework.Logger.create('[MyAPI]'));
```

## Response Format

All API responses follow this standardized format:

```typescript
// Success Response
{
    "success": true,
    "data": { /* your response data */ },
    "timestamp": "2024-01-01T12:00:00.000Z"
}

// Error Response
{
    "success": false,
    "error": {
        "code": "ValidationError",
        "message": "Request validation failed",
        "details": { /* additional error info */ }
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Error Codes

- `ValidationError`: Request validation failed
- `AuthenticationError`: Authentication required or failed
- `AuthorizationError`: User not authorized for this action
- `NotFound`: Requested resource not found
- `MethodNotAllowed`: HTTP method not supported
- `BadRequest`: Malformed request
- `InternalError`: Unexpected server error

## Best Practices

1. **Keep Controllers Thin**: Business logic goes in `IApiLogic` implementations
2. **Use Type Safety**: Define interfaces for all request/response types
3. **Handle Errors Gracefully**: Let the framework handle error formatting
4. **Leverage DI**: Use optional services for cross-cutting concerns
5. **Test Thoroughly**: Use the provided test module wrappers

## Testing

Framework components can be tested using the Node.js test module wrappers:

```typescript
import { FrameworkLogger, ApiResponseFormatter, ErrorHandler } from './framework-module';

describe('My Controller Tests', () => {
    it('should handle requests correctly', () => {
        // Test implementation
    });
});
```

## Examples

See `src/Framework/examples/UserController.ts` for a complete working example showing all framework features in action.