# GAS App Framework

A comprehensive TypeScript framework for Google Apps Script (GAS) applications, providing modular architecture, dependency injection, event systems, and robust testing infrastructure.

## 🏗️ Architecture Overview

```
GasAppFramework/
├── src/
│   ├── Modules/           # Core functional modules
│   │   ├── EventSystem/   # Cron jobs, triggers, and workflows
│   │   ├── GasDI/         # Dependency injection container
│   │   ├── Locking/       # Distributed locking mechanisms
│   │   ├── Repository/    # Data persistence abstraction
│   │   ├── Routing/       # URL routing and request handling
│   │   └── StringHelper/  # String templating and utilities
│   └── Shared/            # Common types, errors, and utilities
│       ├── CommonTypes.d.ts    # Shared interfaces (Logger, Clock, etc.)
│       ├── ErrorTypes.d.ts     # Error type definitions
│       ├── Errors.ts           # Base error classes
│       └── Time.ts             # Time utilities
└── test/                  # GAS-compatible test framework
    ├── @entrypoint.ts         # Main test runner (call test_RunAll() in GAS)
    ├── _framework/            # Custom test runner and helpers for GAS
    │   ├── Assert.ts              # Assertion utilities
    │   ├── GasReporter.ts         # Test result reporting  
    │   ├── Runner.ts              # Test execution engine
    │   ├── Test.ts                # Test definition utilities
    │   └── TestHelpers.ts         # Test doubles, GAS mocks, and utilities
    └── Modules/               # Module-specific GAS integration tests
        ├── EventSystem/           # GAS triggers, cron jobs, ScriptApp tests
        ├── GAS/                   # Advanced GAS runtime feature tests
        ├── GasDI/                 # Dependency injection in GAS environment
        ├── Locking/               # LockService and PropertiesService tests
        ├── Repository/            # SpreadsheetApp integration tests
        ├── Routing/               # URL routing tests
        └── StringHelper/          # String utility tests
```

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
cp -r src/Modules/Repository/* your-project/src/
cp -r src/Shared/* your-project/src/
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

## 🏛️ Module Descriptions

### Repository Module
Provides type-safe data persistence with Google Sheets backend.

**Key Features:**
- Schema-based entity validation
- Key encoding/decoding for complex keys
- Upsert operations with change tracking
- Memory and Spreadsheet adapters

**Example Usage:**
```typescript
// Define entity schema
const userSchema: Repository.Ports.Schema<User, 'id'> = {
    parameters: ['id', 'name', 'email'],
    keyParameters: ['id'],
    instantiate: () => ({ id: '', name: '', email: '' }),
    fromPartial: (p) => ({ id: p.id || '', name: p.name || '', email: p.email || '' })
}

// Create repository
const userRepo = Repository.Engine.create({
    schema: userSchema,
    store: new Repository.Adapters.GAS.Spreadsheet.Store('your-sheet-id'),
    keyCodec: Repository.Codec.simple()
})

// Use repository
userRepo.load()
userRepo.upsert({ id: 'user1', name: 'John', email: 'john@example.com' })
const user = userRepo.find({ id: 'user1' })
```

### EventSystem Module
Handles scheduled jobs, triggers, and multi-step workflows.

**Key Features:**
- Cron-based job scheduling
- Multi-step workflow execution
- Timezone-aware scheduling
- Checkpoint recovery for long-running processes

**Example Usage:**
```typescript
// Define a simple job
const jobStore = new EventSystem.Adapters.GAS.SimpleJobStore([{
    id: 'daily-report',
    handler: 'generateDailyReport',
    cron: '0 9 * * *',  // 9 AM daily
    enabled: true
}])

// Run scheduler
const trigger = EventSystem.Trigger.create({
    jobs: jobStore,
    scheduler: new EventSystem.Schedule.CronScheduler(),
    invoker: { invoke: (handler, ctx) => eval(`${handler}(ctx)`) }
})

trigger.run(new Date())
```

### GasDI Module
Dependency injection container for managing component lifecycles.

**Example Usage:**
```typescript
// Register services
GasDI.Root.registerValue('config', { apiKey: 'secret' })
GasDI.Root.registerFactory('logger', () => new ConsoleLogger(), 'singleton')

// Use decorators for injection
@GasDI.Decorators.Resolve()
class UserService {
    constructor(
        @GasDI.Decorators.Inject('logger') private logger: Logger,
        @GasDI.Decorators.Inject('config') private config: Config
    ) {}
}
```

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
2. Review module-specific README files
3. Examine test cases for usage examples
4. Open issues for bugs or feature requests

---

**Framework Version:** 1.0.0  
**GAS Runtime:** V8 (ES2020)  
**TypeScript:** 5.x  
**Node.js:** 16+