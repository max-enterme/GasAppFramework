# Namespace Organization for Google Apps Script

## Namespace Design Philosophy

The GasAppFramework uses a hierarchical namespace structure specifically designed for Google Apps Script compatibility. Since GAS does not support ES modules (import/export), namespaces provide the necessary modular organization while remaining fully compatible with the GAS runtime environment.

**Key Benefits of Namespace Design:**
- Full compatibility with Google Apps Script runtime
- Modular organization without external module systems
- Clear hierarchy and dependency relationships
- Type safety through TypeScript namespace declarations
- No build step required for basic deployment

```
Global Namespaces:
├── Shared                    # Common utilities and base types
│   └── Types                 # Common type definitions
├── Repository                # Data persistence framework
│   ├── Engine               # Core repository functionality
│   ├── Codec                # Key encoding/decoding utilities
│   ├── Adapters             # Storage adapters (GAS, Memory)
│   ├── Ports                # Interface definitions
│   └── Types                # Repository-specific types
├── GasDI                    # Dependency injection
│   ├── Container            # IoC container implementation
│   ├── Decorators           # Injection decorators
│   ├── Root                 # Global container instance
│   └── Ports                # Interface definitions
├── Routing                  # URL routing for web apps
│   ├── Engine               # Route matching and dispatch
│   ├── Adapters             # GAS web app adapters
│   └── Ports                # Interface definitions
├── Locking                  # Distributed locking
│   ├── Engine               # Lock management
│   ├── Adapters             # GAS-specific implementations
│   └── Ports                # Interface definitions
└── StringHelper             # String formatting utilities
```

## Type Definition Organization

### Shared Types (`src/Shared/`)
- `CommonTypes.d.ts` - Interfaces used across multiple modules (Logger, Clock, Random, Brand)
- `ErrorTypes.d.ts` - Error code definitions for all modules

### Module-Specific Types
- `Repository/RepositoryPorts.d.ts` - Repository domain interfaces
- `GasDI/Core.Types.d.ts` - DI container interfaces
- `Routing/RoutingPorts.d.ts` - Routing interfaces
- `Locking/LockingPorts.d.ts` - Locking interfaces
- etc.

## Namespace Usage Patterns

### Accessing Module Functionality
```typescript
// Repository operations
const repo = Repository.Engine.create({ schema, store, keyCodec })
const codec = Repository.Codec.simple('|')

// Dependency injection
const container = new GasDI.Container()
GasDI.Root.registerValue('config', { key: 'value' })

// String utilities
const formatted = StringHelper.formatString('Hello {0}!', 'World')

// Routing
const router = Routing.Engine.create()
router.addRoute('/api/users', handleUsers)

// Locking
const lock = Locking.Engine.acquireLock('resource-id', 30000)
```

### Type Definitions
```typescript
// Using shared types
function createLogger(): Shared.Types.Logger {
    return { info: console.log, error: console.error }
}

// Module-specific types
const schema: Repository.Ports.Schema<User, 'id'> = {
    parameters: ['id', 'name'],
    keyParameters: ['id'],
    instantiate: () => ({ id: '', name: '' }),
    fromPartial: (p) => ({ id: p.id || '', name: p.name || '' })
}
```

## Module Dependencies

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Shared    │    │  Repository  │    │   Routing   │
│ (base types)│◄───┤   (data)     │    │ (web apps)  │
└─────────────┘    └──────────────┘    └─────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   GasDI     │    │   Locking    │    │StringHelper │
│    (DI)     │    │  (locks)     │    │ (utilities) │
└─────────────┘    └──────────────┘    └─────────────┘
```

## File Organization

### Type Definition Files
- Use `.d.ts` extension for pure type definitions
- Group related interfaces in single files
- Provide forward compatibility with triple-slash references

### Implementation Files
- Use `.ts` extension for executable code
- One main export per file (following ESModule conventions)
- Include JSDoc comments for public APIs

### Test Files
- Mirror source structure in `test/` directory
- Use descriptive test names and clear edge case documentation
- Leverage `TestHelpers` for consistent test doubles

## Migration from Legacy Components

Legacy `Ports` interfaces have been removed as part of code modernization:
- All existing namespace references now use modern `Types` definitions
- Original API surfaces are preserved in the modern namespaces
- Migration is complete - legacy compatibility layer has been removed

## Benefits of Namespace Design for GAS

The namespace approach provides several advantages specifically for Google Apps Script:

- **GAS Compatibility**: Works natively in the GAS runtime without any module bundling
- **Zero Build Step**: Can be deployed directly to GAS without transpilation for modules
- **Clear Organization**: Hierarchical structure makes dependencies and relationships obvious
- **Type Safety**: Full TypeScript support with namespace-based type definitions
- **Global Access**: All functionality available globally in the GAS environment
- **Reduced Complexity**: No need to understand module systems or bundling for basic usage
- **IDE Support**: Excellent autocomplete and IntelliSense with TypeScript namespace declarations

---

**Last Updated:** 2025-12-27