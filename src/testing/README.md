# Shared Test Infrastructure

This directory contains test infrastructure that allows shared test code to run in both GAS and Node.js environments.

## Structure

```
src/testing/
├── common/          # Common test framework (T, TAssert) used in GAS
├── gas/             # GAS-specific test utilities
└── node/            # Node.js-specific test utilities
    ├── index.ts     # Public exports
    ├── test-adapter.ts  # Adapter to run GAS tests in Jest
    └── test-utils.ts    # GAS environment mocks for Node.js
```

## Test Adapter

The test adapter (`test-adapter.ts`) bridges GAS testing framework (`T`, `TAssert`) with Jest, allowing shared tests to run in Node.js without modification.

### Usage in Library Projects

When this framework is imported as a library, consumers can use the test adapter to run shared tests:

```typescript
import { setupTestAdapter } from 'gas-app-framework/testing/node';
import { registerMySharedTests } from './shared/my-module/core.test';

// Set up adapter before running shared tests
setupTestAdapter();

// Now shared tests using T and TAssert will work in Jest
describe('My Module Tests', () => {
    registerMySharedTests();
});
```

### API

**`setupTestAdapter()`**
- Injects `T` and `TAssert` into global scope
- Maps GAS test assertions to Jest equivalents

**`TestAdapter`**
- `it(description, testFn, category?)` - Maps to Jest's `test()`

**`AssertAdapter`**
- `equals(actual, expected, message?)` - Maps to `expect(actual).toBe(expected)`
- `isTrue(value, message?)` - Maps to `expect(value).toBe(true)`
- `isFalse(value, message?)` - Maps to `expect(value).toBe(false)`
- `throws(fn, message?)` - Maps to `expect(fn).toThrow()`
- `notThrows(fn, message?)` - Maps to `expect(fn).not.toThrow()`
- `isNull(value, message?)` - Maps to `expect(value).toBeNull()`
- `isNotNull(value, message?)` - Maps to `expect(value).not.toBeNull()`
- `isDefined(value, message?)` - Maps to `expect(value).toBeDefined()`
- `isUndefined(value, message?)` - Maps to `expect(value).toBeUndefined()`
- `fail(message?)` - Throws an error

## Benefits

✅ **Write Once, Test Everywhere**: Shared tests run in both GAS and Node.js  
✅ **Type Safety**: Full TypeScript support in both environments  
✅ **Zero Duplication**: No need to maintain separate test suites  
✅ **Library Ready**: Consumers can run your shared tests with their modules  

## Example: Creating a Shared Test

```typescript
// test/shared/mymodule/core.test.ts
export function registerMyModuleCoreTests() {
    T.it('should do something', () => {
        const result = MyModule.doSomething();
        TAssert.equals(result, 'expected', 'description');
    }, 'MyModule');
}

// GAS environment - auto-register
if (typeof T !== 'undefined') {
    registerMyModuleCoreTests();
}
```

```typescript
// test/node/shared/mymodule.test.ts
import { setupTestAdapter } from '../../../src/testing/node/test-adapter';
import { registerMyModuleCoreTests } from '../../shared/mymodule/core.test';
import { doSomething } from '../integration/mymodule-module';

setupTestAdapter();
(globalThis as any).MyModule = { doSomething };

describe('MyModule Core Tests (Shared)', () => {
    registerMyModuleCoreTests();
});
```

## Current Shared Tests

- **Routing**: Core routing functionality tests
- **StringHelper**: String manipulation utilities tests
- **Repository**: Data repository operations tests
- **GasDI**: Dependency injection container tests
- **Locking**: Concurrency locking mechanism tests

All shared tests are automatically run in both GAS and Node.js/Jest environments.
