# GasAppFramework Test Infrastructure Usage Guide

This guide explains how to use the GasAppFramework test infrastructure in your external projects. The framework provides a comprehensive testing system designed specifically for Google Apps Script (GAS) environments with support for categorized test organization.

## 📋 Overview

When you import GasAppFramework as a library, you gain access to a powerful test infrastructure that includes:

- **Category-based test organization** - Group tests by functionality or module
- **GAS-optimized test runner** - Designed for the GAS execution environment
- **Comprehensive assertion library** - Built-in assertions for common test scenarios
- **Mock utilities** - GAS service mocks for isolated testing
- **Flexible entry points** - Create custom test runners for your project

## 🚀 Quick Start

### 1. Setting Up Tests in Your Project

Create a test directory structure in your GAS project:

```
your-project/
├── src/                        # Your source code
└── test/                       # Test files
    ├── @entrypoint.ts         # Your test entry points
    ├── YourModule/            # Module-specific tests
    │   ├── @entrypoint.ts     # Module test entry point
    │   └── *.ts               # Test files
    └── _helpers/              # Optional: project-specific helpers
```

### 2. Basic Test File Structure

Create test files using the framework's test registration system:

```typescript
/**
 * Tests for YourModule
 */

// Register tests with categories
T.it('should perform basic functionality', () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = YourModule.processData(input);
    
    // Assert
    TAssert.equals(result.status, 'success', 'Should process successfully');
    TAssert.isTrue(result.data.length > 0, 'Should return data');
}, 'YourModule');

T.it('should handle edge cases', () => {
    // Test edge cases
    TAssert.throws(() => YourModule.processData(null), 'Should throw on null input');
}, 'YourModule');
```

### 3. Creating Entry Point Functions

Create test entry points in your `test/@entrypoint.ts` file:

```typescript
// Entry point to run all your project tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunYourProject() {
    const results = TRunner.runByCategory('YourModule');
    TGasReporter.printCategory(results, 'YourModule');
}

// Entry point to run all tests (including GasAppFramework tests)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunAllWithYourProject() {
    const results = TRunner.runAll();
    TGasReporter.print(results);
}

// Utility to show your project's test categories
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_ListYourProjectCategories() {
    const logger = (typeof Logger !== 'undefined') ? Logger : console;
    const categories = T.categories().filter(cat => 
        cat.startsWith('YourProject') || cat === 'YourModule'
    );
    
    logger.log(`\n📋 Your Project Test Categories (${categories.length}):`);
    categories.forEach(cat => {
        const count = T.byCategory(cat).length;
        logger.log(`  📂 ${cat} (${count} tests)`);
    });
}
```

## 🏗️ Test Infrastructure Components

### Core Framework Components

The GasAppFramework provides these essential components:

| Component | Purpose | Usage |
|-----------|---------|-------|
| `T.it()` | Test registration | `T.it('test name', () => { /* test */ }, 'Category')` |
| `TRunner` | Test execution | `TRunner.runAll()`, `TRunner.runByCategory('Category')` |
| `TAssert` | Assertions | `TAssert.equals()`, `TAssert.isTrue()`, `TAssert.throws()` |
| `TGasReporter` | Test reporting | `TGasReporter.print()`, `TGasReporter.printCategory()` |
| `TestHelpers` | GAS mocks & utilities | `TestHelpers.GAS.installAll()` |

### Test Registration

Register tests using the `T.it()` function:

```typescript
T.it('descriptive test name', () => {
    // Test implementation
    TAssert.isTrue(someCondition, 'Failure message');
}, 'CategoryName');
```

**Parameters:**
- `name` (string) - Descriptive test name
- `fn` (function) - Test function to execute
- `category` (string, optional) - Category for organizing tests (defaults to 'General')

### Assertions

Available assertion methods:

```typescript
// Boolean assertions
TAssert.isTrue(value, 'Should be true');

// Equality assertions
TAssert.equals(actual, expected, 'Should be equal');

// Exception assertions
TAssert.throws(() => riskyFunction(), 'Should throw an error');

// Custom failure
TAssert.fail('Custom failure message');
```

### Test Categories

Organize your tests using categories. You can use existing framework categories or create your own:

**Framework Categories:**
- `EventSystem` - Event handling and triggers
- `Repository` - Data persistence
- `Locking` - Distributed locking
- `GasDI` - Dependency injection
- `GAS` - GAS runtime features
- `Routing` - URL routing
- `StringHelper` - String utilities
- `General` - Uncategorized tests

**Your Project Categories:**
```typescript
// Create your own categories
T.it('test name', () => { /* test */ }, 'YourProjectCore');
T.it('test name', () => { /* test */ }, 'YourProjectAPI');
T.it('test name', () => { /* test */ }, 'YourProjectUtils');
```

## 🎯 Running Tests

### Running Built-in GasAppFramework Tests

```typescript
// Run all framework tests
test_RunAll()

// Run specific framework module tests
test_RunByCategory('EventSystem')
test_RunByCategory('Repository')

// List available categories
test_ListCategories()

// Show module help
test_ShowModuleHelp()
```

### Running Your Project Tests

```typescript
// Run only your project's tests
test_RunYourProject()

// Run specific category of your tests
test_RunByCategory('YourModule')

// Run all tests (framework + your project)
test_RunAllWithYourProject()
```

### In Google Apps Script IDE

1. **Deploy your project:**
   ```bash
   clasp push
   ```

2. **Open the GAS Script Editor and run functions:**
   - Click on the function dropdown
   - Select your test function (e.g., `test_RunYourProject`)
   - Click the run button
   - Check the execution log for results

## 🧪 Advanced Usage

### Using GAS Service Mocks

For testing code that uses GAS services:

```typescript
T.it('should work with mocked GAS services', () => {
    // Install GAS mocks
    TestHelpers.GAS.installAll();
    
    try {
        // Your test code here
        const result = YourModule.useSpreadsheetService();
        TAssert.isTrue(result.success, 'Should succeed with mocked services');
    } finally {
        // Clean up mocks
        TestHelpers.GAS.resetAll();
    }
}, 'YourModule');
```

### Creating Module-Specific Entry Points

For larger projects, create module-specific test entry points:

```typescript
// test/YourModule/@entrypoint.ts

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunYourModule() {
    const results = TRunner.runByCategory('YourModule');
    TGasReporter.printCategory(results, 'YourModule');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunYourModuleDemo() {
    // Demo tests to verify the category system
    T.it('Demo YourModule Test', () => {
        TAssert.isTrue(true, 'Demo test should pass');
    }, 'YourModule');
    
    const results = TRunner.runByCategory('YourModule');
    TGasReporter.printCategory(results, 'YourModule');
}
```

### Custom Test Helpers

Create project-specific test helpers:

```typescript
// test/_helpers/YourProjectHelpers.ts

namespace YourProjectHelpers {
    export function createTestData() {
        return {
            id: 'test-123',
            name: 'Test Item',
            created: new Date()
        };
    }
    
    export function assertValidResponse(response: any) {
        TAssert.isTrue(response.hasOwnProperty('status'), 'Should have status');
        TAssert.isTrue(response.hasOwnProperty('data'), 'Should have data');
    }
}
```

## 📊 Test Output

Tests are organized by category in the output:

```
[TEST] total=15 ok=13 ng=2

📂 [YourModule] 8 tests (✅7 ❌1)
  ✅ should perform basic functionality (2ms)
  ✅ should handle edge cases (1ms)
  ❌ should handle complex scenarios (3ms) :: Error details

📂 [YourProjectCore] 7 tests (✅6 ❌1)
  ✅ core functionality works correctly (1ms)
  ✅ configuration is loaded properly (0ms)
```

## 🔧 Best Practices

### 1. Naming Conventions

```typescript
// Good test names
T.it('should calculate total price including tax', () => { ... }, 'PriceCalculator');
T.it('should throw error when input is negative', () => { ... }, 'PriceCalculator');

// Use descriptive category names
T.it('test name', () => { ... }, 'YourProjectPayment');
T.it('test name', () => { ... }, 'YourProjectValidation');
```

### 2. Test Organization

```typescript
// Group related tests in the same file
// test/YourModule/validation_spec.ts
T.it('should validate email format', () => { ... }, 'YourModuleValidation');
T.it('should validate phone format', () => { ... }, 'YourModuleValidation');

// test/YourModule/calculation_spec.ts
T.it('should calculate discounts', () => { ... }, 'YourModuleCalculation');
T.it('should handle tax rates', () => { ... }, 'YourModuleCalculation');
```

### 3. GAS-Specific Testing

```typescript
T.it('should work with GAS execution limits', () => {
    TestHelpers.GAS.installAll();
    
    try {
        // Test long-running operations
        const startTime = Date.now();
        YourModule.processLargeDataset();
        const duration = Date.now() - startTime;
        
        TAssert.isTrue(duration < 300000, 'Should complete within 5 minutes');
    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'YourModulePerformance');
```

## 🚨 Troubleshooting

### Common Issues

1. **Tests not appearing in categories:**
   - Ensure you're passing the category parameter to `T.it()`
   - Check for typos in category names

2. **GAS service errors:**
   - Use `TestHelpers.GAS.installAll()` before tests that use GAS services
   - Always call `TestHelpers.GAS.resetAll()` in finally blocks

3. **Entry point functions not visible:**
   - Ensure functions are at the global scope
   - Add `// eslint-disable-next-line @typescript-eslint/no-unused-vars` comment

### Getting Help

- Check the main test framework documentation: `test/README.md`
- Review existing framework tests for examples
- Use `test_ListCategories()` to see available categories
- Use `test_ShowModuleHelp()` to see framework entry points

## 📚 Examples

### Complete Example: Testing a Calculator Module

```typescript
// test/Calculator/@entrypoint.ts

// Entry point for Calculator module tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunCalculator() {
    const results = TRunner.runByCategory('Calculator');
    TGasReporter.printCategory(results, 'Calculator');
}

// test/Calculator/basic_operations_spec.ts

T.it('should add two numbers correctly', () => {
    const result = Calculator.add(2, 3);
    TAssert.equals(result, 5, 'Addition should work correctly');
}, 'Calculator');

T.it('should handle division by zero', () => {
    TAssert.throws(() => Calculator.divide(10, 0), 'Should throw on division by zero');
}, 'Calculator');

// test/Calculator/gas_integration_spec.ts

T.it('should save calculation results to spreadsheet', () => {
    TestHelpers.GAS.installAll();
    
    try {
        const result = Calculator.add(2, 3);
        const saved = Calculator.saveToSpreadsheet(result);
        TAssert.isTrue(saved, 'Should save to spreadsheet successfully');
    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Calculator');
```

This comprehensive setup allows you to:
- Test your calculator functionality in isolation
- Test GAS integration with mocked services
- Run targeted tests for your calculator module
- Integrate with the broader framework test suite

Happy testing! 🎉