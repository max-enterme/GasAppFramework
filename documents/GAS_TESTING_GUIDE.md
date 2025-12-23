# GAS Testing Guide

This document provides comprehensive instructions for running and developing Google Apps Script (GAS) specific tests in the GAS App Framework.

## Overview

The framework provides two types of testing:

1. **Node.js Tests** (`test_node/`) - For business logic and unit testing
2. **GAS Tests** (`test/`) - For integration testing with GAS services and APIs

## GAS Test Structure

```
test/
├── @entrypoint.ts              # Main test runner entry point
├── _framework/                 # GAS testing framework
│   ├── Assert.ts               # Assertion utilities
│   ├── GasReporter.ts          # Test result reporting
│   ├── Runner.ts               # Test execution engine
│   ├── Test.ts                 # Test definition utilities
│   └── TestHelpers.ts          # Mocks and test utilities
└── Modules/                    # Module-specific tests
    ├── EventSystem/
    │   ├── gas_integration_spec.ts    # GAS-specific EventSystem tests
    │   ├── schedule_spec.ts           # Schedule engine tests
    │   ├── trigger_spec.ts            # Trigger engine tests
    │   └── workflow_spec.ts           # Workflow engine tests
    ├── GAS/
    │   └── gas_advanced_spec.ts       # Advanced GAS runtime features
    ├── GasDI/
    │   ├── gas_di_spec.ts             # GAS-specific DI container tests
    │   └── gasdi_spec.ts              # Core DI tests
    ├── Locking/
    │   ├── gas_locking_spec.ts        # GAS LockService integration tests
    │   └── locking_spec.ts            # Core locking tests
    ├── Repository/
    │   ├── gas_spreadsheet_spec.ts    # SpreadsheetApp integration tests
    │   └── repo_memory_spec.ts        # Memory store tests
    ├── Routing/
    │   └── routing_spec.ts            # URL routing tests
    └── StringHelper/
        └── stringhelper_spec.ts       # String utilities tests
```

## Running GAS Tests

### Method 1: GAS IDE (Recommended for development)

1. **Deploy to GAS Project**:
   ```bash
   # Ensure you have clasp installed and configured
   npm install -g @google/clasp
   clasp login
   
   # Push the framework to your GAS project
   clasp push
   ```

2. **Run Tests in GAS Editor**:
   - Open your GAS project in the Apps Script editor
   - Find the `test_RunAll` function in the script editor
   - Click "Run" or use `Ctrl+R` to execute
   - View results in the execution transcript

3. **View Test Results**:
   ```
   [TEST] total=45 ok=43 ng=2
   ✅ GAS GlobalInvoker calls global functions correctly (12ms)
   ✅ GAS SpreadsheetJobStore loads jobs from spreadsheet correctly (8ms)
   ❌ GAS error handling in distributed environment (15ms) :: Expected behavior not met
   ```

### Method 2: clasp Command Line

1. **Run via clasp**:
   ```bash
   # Push latest changes
   clasp push
   
   # Execute the test function
   clasp run test_RunAll
   ```

2. **Run specific test modules** (if needed):
   ```bash
   # You can create specific test runners for modules
   clasp run test_EventSystem_Only  # If implemented
   ```

### Method 3: Automated Testing via GitHub Actions

The framework can be integrated with CI/CD pipelines:

```yaml
# .github/workflows/gas-tests.yml
name: GAS Integration Tests
on: [push, pull_request]

jobs:
  gas-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm install -g @google/clasp
      - run: echo "$CLASP_CREDENTIALS" | base64 -d > ~/.clasprc.json
        env:
          CLASP_CREDENTIALS: ${{ secrets.CLASP_CREDENTIALS }}
      - run: clasp push
      - run: clasp run test_RunAll
```

## GAS-Specific Test Features

### 1. GAS Environment Simulation

The framework provides comprehensive mocks for GAS services:

```typescript
// Available in TestHelpers.GAS namespace
TestHelpers.GAS.installAll();  // Install all mocks

try {
    // Your test code using GAS services
    const sheet = SpreadsheetApp.openById('test-id');
    const user = Session.getActiveUser();
    Logger.log('Test message');
} finally {
    TestHelpers.GAS.resetAll();  // Clean up
}
```

### 2. Supported GAS Services

- **SpreadsheetApp**: Full spreadsheet operations with MockSpreadsheet, MockSheet, MockRange
- **ScriptApp**: Trigger management with MockTrigger, MockTriggerBuilder
- **Session**: User context and timezone with MockSession
- **Utilities**: Date formatting and sleep operations with MockUtilities
- **LockService**: Distributed locking with MockLockService, MockLock
- **Logger**: Console logging with MockLogger
- **PropertiesService**: Script and user properties (add manually in tests)

### 3. Test Patterns

#### Testing SpreadsheetApp Integration
```typescript
T.it('Repository loads data from spreadsheet', () => {
    TestHelpers.GAS.installAll();
    
    try {
        const mockApp = globalThis.SpreadsheetApp as TestHelpers.GAS.MockSpreadsheetApp;
        
        // Setup test data
        mockApp.setupSpreadsheet('test-sheet', {
            'Users': [
                ['id', 'name', 'email'],
                ['1', 'Alice', 'alice@example.com'],
                ['2', 'Bob', 'bob@example.com']
            ]
        });
        
        // Test your code
        const repository = createUserRepository('test-sheet');
        const users = repository.loadAll();
        
        TAssert.equals(users.length, 2, 'Should load 2 users');
    } finally {
        TestHelpers.GAS.resetAll();
    }
});
```

#### Testing Trigger-Based Workflows
```typescript
T.it('EventSystem creates and manages triggers', () => {
    TestHelpers.GAS.installAll();
    
    try {
        const mockScriptApp = globalThis.ScriptApp as TestHelpers.GAS.MockScriptApp;
        
        // Create trigger
        const trigger = mockScriptApp
            .newTrigger('dailyReport')
            .timeBased()
            .everyDays(1)
            .create();
        
        TAssert.equals(trigger.getHandlerFunction(), 'dailyReport', 'Trigger should be created');
        TAssert.equals(mockScriptApp.getScriptTriggers().length, 1, 'Should have 1 trigger');
    } finally {
        TestHelpers.GAS.resetAll();
    }
});
```

#### Testing Error Scenarios
```typescript
T.it('Handles GAS service failures gracefully', () => {
    TestHelpers.GAS.installAll();
    
    try {
        // Test normal operation
        const session = globalThis.Session;
        TAssert.equals(session.getScriptTimeZone(), 'America/New_York', 'Should work normally');
        
        // Simulate service failure
        delete (globalThis as any).Session;
        
        TAssert.throws(
            () => someCodeThatUsesSession(),
            'Should handle missing GAS service'
        );
    } finally {
        TestHelpers.GAS.resetAll();
    }
});
```

## Writing New GAS Tests

### 1. Test File Structure

Create new test files following the naming convention `*_spec.ts`:

```typescript
/**
 * GAS-Specific Tests for [Module Name]
 * 
 * Description of what this test file covers, including any special
 * GAS services or APIs being tested.
 */

namespace Spec_ModuleName_GAS {
    
    T.it('Test description with GAS context', () => {
        // Test Case: Clear description of what is being tested
        TestHelpers.GAS.installAll();
        
        try {
            // Setup: Describe test setup
            
            // Test: Describe what is being tested
            
            // Verify: Describe assertions
            
        } finally {
            TestHelpers.GAS.resetAll();
        }
    });
}
```

### 2. Test Categories

#### Core GAS Integration Tests
- SpreadsheetApp operations (reading, writing, formatting)
- Trigger management (time-based, event-based)
- PropertiesService configuration storage
- Session user context and timezone handling

#### Advanced GAS Features
- LockService distributed locking
- Execution time limits and quota handling
- Error handling and recovery
- Multi-user scenarios

#### Framework-Specific Tests
- Module integration with GAS services
- Dependency injection in GAS environment
- Repository patterns with Spreadsheet backend
- EventSystem workflow execution

### 3. Best Practices

#### Use Descriptive Test Names
```typescript
// Good
T.it('GAS SpreadsheetStore handles empty sheets gracefully', () => {});

// Better
T.it('GAS SpreadsheetStore returns empty array for sheets with only headers', () => {});
```

#### Test Edge Cases
```typescript
T.it('GAS service handles quota exceeded errors', () => {
    // Test quota limits, timeouts, permission errors
});

T.it('GAS SpreadsheetStore handles malformed data gracefully', () => {
    // Test empty cells, wrong data types, missing columns
});
```

#### Include Performance Considerations
```typescript
T.it('GAS batch operations complete within execution limits', () => {
    // Test that operations complete within 6-minute GAS limit
    // Test batch processing for large datasets
});
```

#### Document GAS-Specific Behaviors
```typescript
T.it('GAS timezone handling affects date calculations', () => {
    // Test Case: GAS Session.getScriptTimeZone() affects date formatting
    // This is specific to GAS environment and different from Node.js
});
```

## Debugging GAS Tests

### 1. Using GAS Logger
```typescript
T.it('Debug test with detailed logging', () => {
    TestHelpers.GAS.installAll();
    
    try {
        const mockLogger = globalThis.Logger as TestHelpers.GAS.MockLogger;
        
        // Your test code
        someComplexOperation();
        
        // Check logs for debugging
        const logs = mockLogger.getAllLogs();
        console.log('GAS Logs:', logs); // For Node.js debugging
        
        // In GAS IDE, logs appear in execution transcript
    } finally {
        TestHelpers.GAS.resetAll();
    }
});
```

### 2. Inspecting Mock State
```typescript
// Check spreadsheet state
const sheet = mockApp.openById('test-id').getSheetByName('TestSheet');
console.log('Sheet data:', sheet.getData());

// Check trigger state
const triggers = mockScriptApp.getScriptTriggers();
console.log('Active triggers:', triggers.map(t => t.getHandlerFunction()));
```

### 3. Step-by-Step Debugging
```typescript
T.it('Debug complex workflow step by step', () => {
    TestHelpers.GAS.installAll();
    
    try {
        // Step 1: Setup
        TAssert.equals(setupStep(), expectedResult, 'Setup should succeed');
        
        // Step 2: Process
        TAssert.equals(processStep(), expectedResult, 'Process should succeed');
        
        // Step 3: Verify
        TAssert.equals(verifyStep(), expectedResult, 'Verify should succeed');
    } finally {
        TestHelpers.GAS.resetAll();
    }
});
```

## Troubleshooting

### Common Issues

1. **Tests not found**: Ensure test files are in the `test/` directory and follow `*_spec.ts` naming
2. **GAS services undefined**: Always call `TestHelpers.GAS.installAll()` before using GAS services
3. **Memory leaks**: Always call `TestHelpers.GAS.resetAll()` in finally blocks
4. **Quota errors in real GAS**: Use batch operations and add delays with `Utilities.sleep()`
5. **Permission errors**: Ensure GAS project has necessary permissions for services being tested

### Performance Tips

1. **Batch spreadsheet operations**: Test with realistic data sizes
2. **Use appropriate mock data**: Don't create unnecessarily large datasets
3. **Test timeout scenarios**: Simulate GAS execution time limits
4. **Profile test execution**: Measure test performance in GAS environment

### Integration with CI/CD

1. **Store GAS credentials securely**: Use GitHub Secrets for clasp authentication
2. **Test on schedule**: Run GAS tests periodically to catch API changes
3. **Separate fast/slow tests**: Run critical tests first, comprehensive tests separately
4. **Monitor quotas**: Track GAS usage in automated testing

## Additional Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [clasp Command Line Tool](https://github.com/google/clasp)
- [GAS Runtime Limits](https://developers.google.com/apps-script/guides/services/quotas)
- [Framework Repository Tests](./test/) - Examples of all test patterns