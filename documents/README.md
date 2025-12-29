# GAS App Framework

A comprehensive TypeScript framework for Google Apps Script (GAS) applications, providing modular architecture, dependency injection, REST API framework, and robust testing infrastructure.

## 🏗️ Architecture Overview

```
GasAppFramework/
├── modules/                     # ES Modules source code
│   ├── di/                      # Dependency injection container
│   ├── locking/                 # Distributed locking mechanisms
│   ├── repository/              # Data persistence abstraction
│   ├── routing/                 # URL routing and request handling
│   ├── rest-framework/          # REST API framework
│   ├── string-helper/           # String templating and utilities
│   ├── testing/                 # Test framework modules
│   │   ├── Assert.ts                # Assertion utilities
│   │   ├── Test.ts                  # Test definition utilities
│   │   ├── Runner.ts                # Test execution engine
│   │   └── index.ts                 # Test exports
│   ├── test-runner/             # Web-based test runner (doGet handler)
│   ├── shared/                  # Common types, errors, and utilities
│   │   ├── Errors.ts                # Base error classes
│   │   └── Time.ts                  # Time utilities
│   └── index.ts                 # Framework entry point
├── build/                       # Build output (pushed to GAS)
│   ├── main.js (110 KiB)            # Webpack bundle with doGet handler
│   └── *.d.ts                       # TypeScript type definitions
├── test/                        # Framework's own tests
│   ├── Modules/                 # GAS integration tests
│   │   ├── GAS/                     # Advanced GAS runtime feature tests
│   │   ├── GasDI/                   # Dependency injection in GAS environment
│   │   ├── Locking/                 # LockService and PropertiesService tests
│   │   ├── Repository/              # SpreadsheetApp integration tests
│   │   ├── Routing/                 # URL routing tests
│   │   └── StringHelper/            # String utility tests
│   ├── node/                    # Node.js test suite (local only)
│   │   ├── shared/                  # Jest wrappers for shared tests
│   │   └── integration/             # Integration tests
│   └── shared/                  # Shared tests (run in both GAS and Node.js)
│       ├── gasdi/                   # GasDI shared tests
│       ├── locking/                 # Locking shared tests
│       ├── repository/              # Repository shared tests
│       ├── routing/                 # Routing shared tests
│       └── stringhelper/            # StringHelper shared tests
├── gas-main.ts                  # GAS entry point (doGet handler)
├── scripts/                     # Build and deployment scripts
│   └── run-gas-tests.js             # CLI tool for remote test execution
└── documents/                   # Documentation
```

**Legend:**
- Files in `build/` are pushed to GAS projects (included in `clasp push`)
- `test/node/` is development only, excluded from GAS deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ for development tooling
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

4. **Build and deploy:**
   ```bash
   npm run build      # Build main.js bundle
   npm run gas:push   # Push to GAS
   npm run gas:deploy # Deploy as web app
   ```

## 🧪 Testing

The framework supports both Node.js testing (for business logic) and GAS testing (for integration).

### Node.js Tests

```bash
# Run all tests
npm run test:node

# Run specific test suites
npm run test:node:shared       # Shared tests (Jest wrappers)
npm run test:node:integration  # Integration tests

# Run with coverage
npm run test:node -- --coverage
```

**Current Coverage:**
- **184 tests passing** in Node.js environment
- **54 shared tests** for core business logic (StringHelper, Routing, Repository, Locking, GasDI)
- **130 integration tests** for complex scenarios

### GAS Tests (Web Test Runner)

The framework includes a built-in web test runner accessible via doGet handler:

**Running Tests:**

1. Build and deploy:
   ```bash
   npm run build       # Build main.js
   npm run gas:push    # Push to GAS
   npm run gas:deploy  # Deploy as web app
   ```

2. Run tests via CLI:
   ```bash
   npm run gas:test                        # Run all tests
   npm run gas:test -- --category=Routing  # Run specific category
   npm run gas:test -- --list              # List test categories
   ```

3. Or access the web URL directly:
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?all=true
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?category=StringHelper
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?list=true
   ```

**Test Coverage:**
- **55 tests** in GAS environment (9 passing, 46 require TestHelpers.installAll())
- **Repository**: SpreadsheetApp integration, data persistence
- **Locking**: LockService integration, PropertiesService distributed locking
- **GasDI**: Dependency injection with GAS services
- **Routing**: URL routing and request handling
- **StringHelper**: String templating and formatting utilities

**For detailed testing instructions, see:**
- [test/README.md](../test/README.md) - Comprehensive test organization guide
- [GAS_TESTING_GUIDE.md](./GAS_TESTING_GUIDE.md) - GAS-specific testing patterns

## 📚 Using as a Library

The GasAppFramework can be used as a library in external GAS projects.

### Using in GAS Projects

After deploying to your GAS project, all modules are available globally:

```typescript
// Use Repository module
const repo = Repository.Engine.create({
    schema: mySchema,
    store: myStore,
    keyCodec: myCodec
});

// Use StringHelper
const formatted = StringHelper.formatString('Hello {0}!', 'World');

// Use Testing framework
T.it('my test', () => {
  TAssert.equals(myFunction(), expected);
}, 'MyCategory');
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


### Deployment Configuration

When deploying to GAS, the `.claspignore` file ensures only necessary files are pushed:

**Pushed to GAS:**
- `build/main.js` - Webpack bundle with all modules and doGet handler
- `build/**/*.d.ts` - TypeScript type definitions
- `test/Modules/` - GAS integration tests
- `test/shared/` - Shared tests (executed in both environments)
- `appsscript.json` - GAS configuration

**NOT pushed to GAS (local only):**
- `modules/` - Source code (only build output is pushed)
- `gas-main.ts` - Entry point source (only main.js is pushed)
- `test/node/` - Node.js test files
- `node_modules/` - Dependencies
- Development config files (webpack.config.js, tsconfig.json, etc.)

## 📦 Module Usage

### Available Modules

After deployment to GAS, these modules are available globally:

1. **Repository** - Data persistence with Google Sheets
2. **GasDI** - Dependency injection container
3. **Routing** - Web app request routing
4. **Locking** - Distributed locks
5. **StringHelper** - Template string processing
6. **RestFramework** - REST API framework
7. **Testing** - Test framework (T, TAssert, TRunner)
8. **TestRunner** - Web-based test runner

### Deployment Methods

#### Standard Deployment (Recommended)
Deploy the entire framework:
```bash
npm run build      # Webpack bundles all modules into main.js
npm run gas:push   # Push build/ to GAS
npm run gas:deploy # Deploy as web app
```

#### Manual Deployment
```bash
clasp push   # Push files to GAS
clasp deploy # Create new deployment
```

## 🔧 Configuration

### Webpack Configuration
- Single entry point: `gas-main.ts`
- Output: `build/main.js` (110 KiB)
- Target: ES2020 (GAS V8 runtime)
- Format: IIFE (Immediately Invoked Function Expression)

### TypeScript Configuration
- ES2020 target for modern GAS runtime
- Strict type checking enabled
- Declaration file generation
- Source maps for debugging

### ESLint Configuration
- GAS-optimized rules
- TypeScript support
- Node.js and Jest environments

## 🏛️ Framework Modules

Each module provides specific functionality:

- **GasDI** - Dependency injection container
- **Locking** - Distributed locks and concurrency control
- **Repository** - Type-safe data persistence with Google Sheets
- **Routing** - Web app request routing
- **StringHelper** - String templating and formatting utilities
- **RestFramework** - REST API controllers and routing
- **Testing** - Test definition and assertion framework
- **TestRunner** - Web-based test execution

## 🎯 Best Practices

### Error Handling
- Use typed error codes from error types
- Extend base error classes for domain-specific errors
- Log errors with structured context

### Testing
- Write tests in `test/Modules/` for GAS integration
- Write tests in `test/node/` for Node.js unit/integration testing
- Use shared tests in `test/shared/` for cross-environment testing
- Test via CLI: `npm run gas:test`

### Type Safety
- All modules are fully typed
- Use TypeScript for development
- Leverage IDE autocomplete with generated .d.ts files

### Performance
- Use lazy loading for expensive operations
- Implement proper caching strategies
- Batch operations when possible (especially with SpreadsheetApp)

## 🏗️ Architecture

The framework uses ES Modules in development and Webpack bundling for GAS deployment:

```typescript
// Development (modules/)
import { Container } from './di/Container';
import { Engine } from './repository/Engine';

// After deployment to GAS (global access)
const container = GasDI.Container.create();
const repo = Repository.Engine.create({ schema, store, keyCodec });
```

**Why Webpack for GAS:**
- GAS doesn't support ES modules natively
- Webpack bundles all modules into single IIFE
- Global exports make modules accessible in GAS
- Type definitions enable IDE support
- doGet handler integrated in bundle

## 🤝 Contributing

1. Follow ES Modules patterns in `modules/`
2. Add comprehensive tests for new features
3. Update type definitions
4. Document public APIs with JSDoc comments
5. Ensure build succeeds: `npm run build`

## 📄 License

To be determined

## 🆘 Support

For issues, questions, or contributions:
1. Check existing documentation and tests
2. Review [test/README.md](../test/README.md) for test organization
3. Examine test cases for usage examples
4. See [QUICKSTART_GAS.md](../QUICKSTART_GAS.md) and [GAS_DEPLOYMENT.md](../GAS_DEPLOYMENT.md) for deployment guides

---

**Framework Version:** 1.0.0  
**Build Output:** main.js (110 KiB)  
**GAS Runtime:** V8 (ES2020)  
**TypeScript:** 5.x  
**Node.js:** 18+
