# GAS App Framework

A comprehensive TypeScript framework for Google Apps Script (GAS) applications, providing modular architecture, dependency injection, event systems, and robust testing infrastructure.

## 🏗️ Architecture Overview

```
GasAppFramework/
├── src/
│   ├── core/                    # Framework core (☆ pushed to GAS)
│   │   ├── modules/             # Core functional modules
│   │   │   ├── GasDI/          # Dependency injection container
│   │   │   ├── Locking/        # Distributed locking mechanisms
│   │   │   ├── Repository/     # Data persistence abstraction
│   │   │   ├── Routing/        # URL routing and request handling
│   │   │   └── StringHelper/   # String templating and utilities
│   │   ├── restframework/       # REST API framework
│   │   ├── shared/              # Common types, errors, and utilities
│   │   │   ├── CommonTypes.d.ts    # Shared interfaces (Logger, Clock, etc.)
│   │   │   ├── ErrorTypes.d.ts     # Error type definitions
│   │   │   ├── Errors.ts           # Base error classes
│   │   │   └── Time.ts             # Time utilities
│   │   └── index.ts             # Core module exports
│   └── testing/                 # Test framework modules
│       ├── common/              # Common test framework (☆ pushed to GAS)
│       │   ├── Assert.ts           # Assertion utilities
│       │   ├── Test.ts             # Test definition utilities
│       │   ├── Runner.ts           # Test execution engine
│       │   └── index.ts            # Common test exports
│       ├── gas/                 # GAS-specific test support (☆ pushed to GAS)
│       │   ├── GasReporter.ts      # Test result reporting for GAS
│       │   ├── TestHelpers.ts      # Test doubles, GAS mocks, and utilities
│       │   └── index.ts            # GAS test exports
│       └── node/                # Node.js-specific test support (local only)
│           ├── test-utils.ts       # Jest test utilities
│           └── index.ts            # Node.js test exports
├── test/                        # GasAppFramework's own GAS tests
│   ├── @entrypoint.ts              # Main test runner (call test_RunAll() in GAS)
│   └── Modules/                    # Module-specific GAS integration tests
│       ├── GAS/                    # Advanced GAS runtime feature tests
│       ├── GasDI/                  # Dependency injection in GAS environment
│       ├── Locking/                # LockService and PropertiesService tests
│       ├── Repository/             # SpreadsheetApp integration tests
│       ├── Routing/                # URL routing tests
│       └── StringHelper/           # String utility tests
└── test_node/                   # GasAppFramework's own Node.js tests (local only)
```

**Legend:**
- ☆ = Pushed to GAS projects (included in `clasp push`)
- (local only) = Development only, excluded from GAS deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ for development tooling
- Google Apps Script project for deployment
- `clasp` CLI tool for GAS deployment

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd GasAppFramework
   ```

2. **Install development dependencies:**
   ```bash
   npm install
   ```

3. **Set up clasp for GAS deployment:**
   ```bash
   npm install -g @google/clasp
   clasp login
   clasp create --type standalone  # or connect to existing project
   ```

## 🧪 Testing

The framework supports both Node.js testing (for business logic) and GAS testing (for integration).

### Node.js Tests

```bash
# Run Jest tests for core business logic
npm run test:node

# Run with coverage
npm run test:node -- --coverage
```

### GAS Tests

The framework includes comprehensive integration tests for GAS-specific functionality:

**Test Coverage:**
- **EventSystem**: GAS triggers, cron jobs, ScriptApp integration, timezone handling
- **Repository**: SpreadsheetApp integration, data persistence, range operations
- **Locking**: LockService integration, PropertiesService distributed locking
- **GasDI**: Dependency injection with GAS services, container scoping
- **Advanced GAS**: Trigger management, script properties, execution limits

**Running Tests:**

1. Deploy the test framework to your GAS project:
   ```bash
   clasp push
   ```

2. In the GAS editor, run the test entry point:
   ```javascript
   // Call this function in GAS editor
   test_RunAll()
   ```

3. View results in the GAS logger or execution transcript:
   ```
   [TEST] total=45 ok=43 ng=2
   ✅ GAS GlobalInvoker calls global functions correctly (12ms)
   ✅ GAS SpreadsheetJobStore loads jobs from spreadsheet correctly (8ms)
   ❌ GAS error handling test (15ms) :: Expected behavior not met
   ```

**For detailed testing instructions and patterns, see [GAS_TESTING_GUIDE.md](./GAS_TESTING_GUIDE.md)**

## 📚 Using as a Library

The GasAppFramework can be used as a library in external projects. The framework provides selective imports for different use cases:

### Core Framework Only

Use only the framework modules in your GAS project:

```typescript
// Import from namespaces (GAS style)
// Framework modules are available globally after deployment

// Use Repository module
const repo = Repository.Engine.create({
    schema: mySchema,
    store: myStore,
    keyCodec: myCodec
});

// Use StringHelper
const formatted = StringHelper.formatString('Hello {0}!', 'World');
```

### Test Framework in GAS Projects

Include the common test framework and GAS-specific test utilities:

```typescript
// Define tests using the common test framework
T.it('should work correctly', () => {
    const result = myFunction();
    TAssert.equals(result, expectedValue);
}, 'MyModule');

// Run tests in GAS
function test_RunAll() {
    const results = TRunner.runAll();
    TGasReporter.print(results);
}

// Use test helpers
const mockLogger = new TestHelpers.Doubles.MockLogger();
TestHelpers.GAS.installAll(); // Install GAS environment mocks
```

### Test Framework in Node.js Projects

For Node.js/Jest testing with GAS compatibility:

```typescript
import { setupGASMocks, createMockLogger } from 'gas-app-framework/testing/node';

// Set up GAS environment mocks
beforeAll(() => {
    setupGASMocks();
});

// Create test data
const logger = createMockLogger();
```

### Deployment Configuration

When deploying to GAS, the `.claspignore` file ensures only necessary modules are pushed:

**Pushed to GAS (☆):**
- `src/core/` - Framework core modules
- `src/testing/common/` - Common test framework (GAS + Node.js compatible)
- `src/testing/gas/` - GAS-specific test utilities
- `test/` - Your GAS test files

**NOT pushed to GAS (local only):**
- `src/testing/node/` - Node.js-specific test utilities
- `test_node/` - Node.js test files
- `node_modules/` - Dependencies
- `*.test.ts`, `*.spec.ts` - Test files

## 📦 Module Downloads & Deployment

### Individual Module Download

Each module can be used independently:

1. **Repository Module** - Data persistence with Google Sheets
2. **EventSystem Module** - Cron jobs and workflow automation  
3. **GasDI Module** - Dependency injection
4. **Routing Module** - Web app request routing
5. **Locking Module** - Distributed locks
6. **StringHelper Module** - Template string processing

### Deployment Methods

#### Option 1: Full Framework
Deploy the entire framework for comprehensive functionality:
```bash
clasp push
```

#### Option 2: Selective Modules
Copy only required modules to your project:
```bash
# Copy specific modules
cp -r src/core/modules/Repository/* your-project/src/
cp -r src/core/shared/* your-project/src/

# Optionally include test framework
cp -r src/testing/common/* your-project/test/framework/
cp -r src/testing/gas/* your-project/test/framework/
```

#### Option 3: Generated Bundle
Use the build process to create optimized bundles:
```bash
npm run build
# Deploy from dist/ folder
```

## 🔧 Configuration

### ESLint Configuration
The framework includes GAS-optimized ESLint rules:
- Allows namespaces for GAS compatibility
- Permits triple-slash references for type declarations
- Configured for TypeScript namespace patterns

### TypeScript Configuration
Optimized for both GAS deployment and Node.js development:
- ES2020 target for modern GAS runtime
- Strict type checking enabled
- Declaration file generation
- Source maps for debugging

## 🏛️ Framework Modules

The framework includes the following modules, each with comprehensive documentation:

- **[Repository](src/Modules/Repository/README.md)** - Type-safe data persistence with Google Sheets
- **[EventSystem](src/Modules/EventSystem/README.md)** - Cron jobs, triggers, and workflow automation  
- **[GasDI](src/Modules/GasDI/README.md)** - Dependency injection container
- **[Routing](src/Modules/Routing/README.md)** - Web app request routing
- **[Locking](src/Modules/Locking/README.md)** - Distributed locks and concurrency control
- **[StringHelper](src/Modules/StringHelper/README.md)** - String templating and formatting utilities

Each module directory contains detailed README files with API documentation, usage examples, and testing strategies.

## 🎯 Best Practices

### Error Handling
- Use typed error codes from `ErrorTypes.d.ts`
- Extend `Shared.DomainError` for domain-specific errors
- Log errors with structured context

### Testing
- Use `TestHelpers.Doubles` for mock objects
- Write both unit tests (Node.js) and integration tests (GAS)
- Test error conditions explicitly

### Type Safety
- Define interfaces in dedicated `.d.ts` files
- Use branded types for entity IDs
- Leverage union types for error codes

### Performance
- Use lazy loading for expensive operations
- Implement proper caching strategies
- Batch operations when possible

## 🏗️ Namespace Architecture for GAS

The framework uses a hierarchical namespace design optimized for Google Apps Script:

```typescript
// Namespace organization provides modular structure
namespace Repository.Engine { 
    export function create() { /*...*/ }
}

// Access patterns in GAS environment
const repo = Repository.Engine.create({ schema, store, keyCodec })
const codec = Repository.Codec.simple('|')
```

**Why Namespaces for GAS:**
- Google Apps Script doesn't support ES modules (import/export)
- Namespaces provide modular organization within GAS constraints
- Zero build step required for deployment
- Full TypeScript support with excellent IDE integration

## 🤝 Contributing

1. Follow the established namespace patterns
2. Add comprehensive tests for new features
3. Update type definitions in separate `.d.ts` files
4. Document public APIs with JSDoc comments
5. Ensure both Node.js and GAS compatibility

## 📄 License

[Add license information here]

## 🆘 Support

For issues, questions, or contributions:
1. Check existing documentation and tests
2. **Review module-specific README files** in `src/Modules/` directories
3. Examine test cases for usage examples
4. Open issues for bugs or feature requests

---

**Framework Version:** 1.0.0  
**GAS Runtime:** V8 (ES2020)  
**TypeScript:** 5.x  
**Node.js:** 16+