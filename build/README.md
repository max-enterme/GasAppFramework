# Namespace to Module Transformation System

## Overview

This system automatically converts GAS (Google Apps Script) namespace-style code to Node.js ES6 modules for testing purposes. This eliminates the need to manually maintain duplicate test modules.

## How It Works

### 1. Source Code (GAS Namespace Style)

```typescript
// src/core/modules/Routing/Engine.ts
namespace Routing {
    export function create() { ... }
}
```

### 2. Auto-Generated Test Module

```typescript
// test/node/integration/routing-module.ts (auto-generated)
export function create() { ... }
export const createRouter = create; // Compatibility export
```

## Configuration

Edit `build/transform.config.json` to add or modify transformations:

```json
{
  "transforms": [
    {
      "name": "Routing Engine",
      "sourceFiles": [
        "src/core/modules/Routing/Core.Types.d.ts",
        "src/core/modules/Routing/Engine.ts"
      ],
      "outputFile": "test/node/integration/routing-module.ts",
      "namespace": "Routing",
      "includeTypes": true,
      "compatibilityExports": [
        "export type RouteContext = { params: Record<string, string>; [key: string]: any };",
        "export const createRouter = create;"
      ]
    }
  ]
}
```

### Configuration Options

- **name**: Human-readable name for the transformation
- **sourceFiles**: Array of source files to transform (processed in order)
- **outputFile**: Path to the generated output file
- **namespace**: The namespace to extract (e.g., "Routing", "Repository")
- **includeTypes**: Whether to include type definitions
- **compatibilityExports** (optional): Additional exports for backward compatibility with existing tests

## Usage

### Manual Generation

```bash
npm run build:test-modules
```

### Automatic Generation

The test modules are automatically regenerated before running tests:

```bash
npm test:node  # Automatically runs build:test-modules first
```

## Transformation Rules

### 1. Namespace Export Conversion

```typescript
// Source
namespace MyModule {
    export function foo() { }
    function bar() { }  // Not exported
}

// Generated
export function foo() { }
function bar() { }  // Kept but not exported
```

### 2. Nested Namespace Handling

```typescript
// Source
namespace Repository.Engine {
    export function create() { }
}

// Generated
export namespace Engine {
    export function create() { }
}
```

### 3. Type Definition Processing

```typescript
// Source (Core.Types.d.ts)
declare namespace Routing {
    namespace Ports {
        type Handler<Ctx, Res> = (ctx: Ctx) => Res
    }
}

// Generated
export namespace Ports {
    export type Handler<Ctx, Res> = (ctx: Ctx) => Res
}
```

### 4. Multi-Level Nested Namespaces

```typescript
// Source
namespace Repository.Adapters.Memory {
    export class Store { }
}

// Generated
export namespace Adapters.Memory {
    export class Store { }
}
```

## Benefits

✅ **Reduced Maintenance**: Source code only needs to be maintained in `src/`, not duplicated in test modules

✅ **Automatic Synchronization**: Test modules are always up-to-date with source code

✅ **Type Safety**: Generated modules include full type information from source

✅ **Backward Compatibility**: Compatibility exports allow gradual migration of existing tests

## File Structure

```
build/
├── transform-namespace-to-module.ts  # Transformation script
├── transform.config.json             # Transformation configuration
└── tsconfig.json                     # TypeScript config for build scripts

test/node/integration/
├── routing-module.ts                 # Auto-generated ⚠️ DO NOT EDIT
├── stringhelper-module.ts            # Auto-generated ⚠️ DO NOT EDIT
└── repository-module.ts              # Auto-generated ⚠️ DO NOT EDIT
```

## Adding New Modules

1. Add a new transformation entry to `build/transform.config.json`:

```json
{
  "name": "New Module",
  "sourceFiles": ["src/core/modules/NewModule/NewModule.ts"],
  "outputFile": "test/node/integration/newmodule-module.ts",
  "namespace": "NewModule",
  "includeTypes": false
}
```

2. Regenerate modules:

```bash
npm run build:test-modules
```

3. Use in tests:

```typescript
import { someFunction } from './newmodule-module';
```

## Technical Details

### Dependencies

- **ts-morph**: TypeScript Compiler API wrapper for AST manipulation
- **ts-node**: Executes TypeScript build scripts directly

### Transformation Process

1. Parse source files using TypeScript Compiler API
2. Extract namespace declarations matching the target namespace
3. Convert namespace exports to ES6 module exports
4. Handle nested namespaces by creating exported namespace blocks
5. Add compatibility exports as specified in configuration
6. Write generated code with warning header

### Known Limitations

- Does not support namespace merging (multiple namespace declarations with the same name)
- Assumes single-file or simple multi-file namespace structures
- References to GAS global APIs (e.g., `SpreadsheetApp`) require mocks in Node.js tests

## Troubleshooting

### Module not generating correctly

1. Check that the namespace name in config matches the source file
2. Ensure source files are listed in correct order
3. Run with verbose logging: `npm run build:test-modules`

### Tests failing after regeneration

1. Check if the source API has changed
2. Update compatibility exports if needed
3. Update tests to match the actual source API

### TypeScript errors in generated modules

1. Ensure `includeTypes: true` is set if type definitions are needed
2. Check that type definition files are included in `sourceFiles`
3. Verify type references are exported from the source namespace

## Migration Plan

1. ✅ **Phase 1**: Build tool created, generating modules in parallel with manual modules
2. **Phase 2**: Validate generated modules match manual modules
3. **Phase 3**: Update tests to work with generated modules
4. **Phase 4**: Delete manual modules, uncomment gitignore entry
5. **Phase 5**: Remove compatibility exports once all tests updated

---

**Current Status**: Phase 1 complete - transformation system operational, generating modules successfully.
