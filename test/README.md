# GAS App Framework - Test Organization Guide

## 📋 Overview

The test framework now supports **categorized testing** with module-specific entry points, making it easy to run focused test suites for different parts of the application.

## 🏗️ Test Structure

```
test/
├── @entrypoint.ts              # Main test entry point
└── Modules/                    # Module-specific tests
    ├── @entrypoint.ts          # Module overview and utilities
    ├── EventSystem/
    │   ├── @entrypoint.ts      # EventSystem-specific entry point
    │   └── *.ts                # EventSystem test files
    ├── Repository/
    │   ├── @entrypoint.ts      # Repository-specific entry point
    │   └── *.ts                # Repository test files
    ├── Locking/
    │   ├── @entrypoint.ts      # Locking-specific entry point
    │   └── *.ts                # Locking test files
    ├── GasDI/
    │   ├── @entrypoint.ts      # GasDI-specific entry point
    │   └── *.ts                # GasDI test files
    └── GAS/
        ├── @entrypoint.ts      # GAS Advanced-specific entry point
        └── *.ts                # GAS Advanced test files

src/testing/                    # Test framework (moved from test/_framework)
├── common/                     # Common test framework (GAS + Node.js)
│   ├── Test.ts                 # Enhanced with category support
│   ├── Runner.ts               # Category-aware test runner
│   ├── Assert.ts               # Test assertions
│   └── index.ts                # Common test exports
├── gas/                        # GAS-specific test support
│   ├── GasReporter.ts          # Category-organized reporting
│   ├── TestHelpers.ts          # GAS service mocks
│   └── index.ts                # GAS test exports
└── node/                       # Node.js-specific test support
    ├── test-utils.ts           # Jest test utilities
    └── index.ts                # Node.js test exports
```

**Note:** The test framework has been moved from `test/_framework/` to `src/testing/` to allow it to be used as a library in external projects.

## 🎯 Available Entry Points

### Main Test Entry Points
- `test_RunAll()` - Run all tests with category organization
- `test_RunByCategory(category)` - Run tests for specific category
- `test_ListCategories()` - Show all available test categories
- `test_ShowModuleHelp()` - Show module-specific entry points

### Module-Specific Entry Points
- `test_RunEventSystem()` - EventSystem module tests only
- `test_RunRepository()` - Repository module tests only
- `test_RunLocking()` - Locking module tests only
- `test_RunGasDI()` - GasDI module tests only
- `test_RunGASAdvanced()` - GAS Advanced tests only

### Demo Entry Points (for testing the category system)
- `test_RunEventSystemDemo()` - Demo tests with EventSystem category
- `test_RunRepositoryDemo()` - Demo tests with Repository category
- `test_RunLockingDemo()` - Demo tests with Locking category
- `test_RunGasDIDemo()` - Demo tests with GasDI category
- `test_RunGASDemo()` - Demo tests with GAS category

## 📊 Enhanced Test Output

Tests are now organized by category in the output:

```
[TEST] total=72 ok=65 ng=7

📂 [EventSystem] 10 tests (✅9 ❌1)
  ✅ GAS GlobalInvoker calls global functions correctly (1ms)
  ✅ GAS SpreadsheetJobStore loads jobs from spreadsheet correctly (5ms)
  ❌ Complete EventSystem workflow in GAS environment (2ms) :: Error details

📂 [Repository] 15 tests (✅15 ❌0)
  ✅ GAS SpreadsheetStore loads data from spreadsheet correctly (1ms)
  ✅ GAS SpreadsheetStore handles empty and malformed sheets (0ms)
  
📂 [Locking] 8 tests (✅2 ❌6)
  ✅ GAS PropertiesStore handles property operations correctly (0ms)
  ❌ GAS distributed locking with PropertiesStore (1ms) :: Invalid time value
```

## 🚀 Usage in GAS IDE

1. **Deploy tests to GAS:**
   ```bash
   clasp push
   ```

2. **Run all tests with organization:**
   ```javascript
   test_RunAll()
   ```

3. **Run specific module tests:**
   ```javascript
   test_RunEventSystem()     // Only EventSystem tests
   test_RunRepository()      // Only Repository tests
   test_RunLocking()         // Only Locking tests
   ```

4. **Explore available options:**
   ```javascript
   test_ListCategories()     // Show all categories
   test_ShowModuleHelp()     // Show module entry points
   ```

## 🛠️ Framework Enhancements

### Enhanced Test Registration
```typescript
// Tests can now include category information
T.it('Test name', () => {
    // Test implementation
}, 'CategoryName');
```

### Category-Aware Runner
```typescript
// Run all tests
const allResults = TRunner.runAll();

// Run tests by category
const categoryResults = TRunner.runByCategory('EventSystem');
```

### Organized Reporting
```typescript
// Print all results with category grouping
TGasReporter.print(results);

// Print category-specific results
TGasReporter.printCategory(results, 'EventSystem');
```

## 📋 Test Categories

The following categories are available:

- **EventSystem** - Cron jobs, triggers, and workflow management
- **Repository** - Data persistence with Google Sheets integration
- **Locking** - Distributed locking mechanisms using GAS services
- **GasDI** - Dependency injection container for GAS services
- **GAS** - Advanced GAS runtime features and application lifecycle
- **Routing** - URL routing and request handling
- **StringHelper** - String templating and utility functions
- **General** - Uncategorized tests (default category)

## 🎯 Benefits

1. **Focused Testing** - Run only the tests relevant to your current work
2. **Organized Output** - Clear categorization makes it easy to identify issues
3. **Modular Development** - Each module has its own test entry point
4. **Better Debugging** - Category-specific test runs help isolate problems
5. **Improved Workflow** - Faster feedback cycles during development

## 🔧 Adding New Tests

When adding new tests, include the category parameter:

```typescript
T.it('New feature test', () => {
    // Test implementation
    TAssert.isTrue(someCondition, 'Should meet condition');
}, 'ModuleName');
```

This ensures your tests are properly categorized and can be run independently when needed.