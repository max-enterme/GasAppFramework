# Namespace Organization and ESModule Migration Guide

## Current Namespace Structure

The GasAppFramework uses a hierarchical namespace structure optimized for Google Apps Script compatibility:

```
Global Namespaces:
├── Shared                    # Common utilities and base types
│   ├── Types                 # Common type definitions  
│   └── (legacy Ports)        # Backward compatibility
├── Repository                # Data persistence framework
│   ├── Engine               # Core repository functionality
│   ├── Codec                # Key encoding/decoding utilities
│   ├── Adapters             # Storage adapters (GAS, Memory)
│   ├── Ports                # Interface definitions
│   └── Types                # Repository-specific types
├── EventSystem              # Job scheduling and workflows
│   ├── Schedule             # Cron scheduling engine
│   ├── Trigger              # Job trigger management
│   ├── Workflow             # Multi-step workflow execution
│   ├── Adapters             # GAS-specific adapters
│   └── Ports                # Interface definitions
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
- `Ports.d.ts` - Legacy compatibility layer (deprecated, use CommonTypes)

### Module-Specific Types
- `Repository/RepositoryPorts.d.ts` - Repository domain interfaces
- `EventSystem/Core.Types.d.ts` - EventSystem interfaces
- `GasDI/Core.Types.d.ts` - DI container interfaces
- etc.

## ESModule Migration Preparation

Each major namespace includes comments showing the future ESModule migration pattern:

### Export Patterns
```typescript
// Current namespace style
namespace Repository.Engine {
    export function create() { /*...*/ }
}

// Future ESModule export
export { create } from './Repository/Engine'
export type { Schema, Store } from './Repository/RepositoryPorts'
```

### Import Patterns
```typescript
// Future ESModule import
import { create as createRepository } from './Repository/Engine'
import { simple as createSimpleCodec } from './Repository/Codec'
import type { Schema, Store, KeyCodec } from './Repository/RepositoryPorts'
```

### Migration Strategy

1. **Phase 1: Preparation (Current)**
   - Namespace structure with ESModule comments
   - Type definition separation
   - Clear module boundaries

2. **Phase 2: Dual Support**
   - Add ESModule exports alongside namespaces
   - Maintain backward compatibility
   - Update documentation

3. **Phase 3: Migration**
   - Migrate to pure ESModule structure
   - Remove namespace declarations
   - Update all import/export statements

## Module Dependencies

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Shared    │    │  Repository  │    │ EventSystem │
│ (base types)│◄───┤   (data)     │◄───┤  (jobs)     │
└─────────────┘    └──────────────┘    └─────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   GasDI     │    │   Locking    │    │   Routing   │
│    (DI)     │    │  (locks)     │    │ (web apps)  │
└─────────────┘    └──────────────┘    └─────────────┘
       ▲
       │
┌─────────────┐
│StringHelper │
│ (utilities) │
└─────────────┘
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

## Backward Compatibility

The refactoring maintains 100% backward compatibility:
- All existing namespace references continue to work
- Legacy `Ports` interfaces aliased to new `Types` definitions  
- Original API surfaces preserved
- Gradual migration path without breaking changes

## Future ESModule Benefits

When migration is complete:
- Better tree-shaking and bundle optimization
- Improved IDE support and autocomplete
- Standard JavaScript module system
- Better interoperability with Node.js tooling
- Cleaner dependency management