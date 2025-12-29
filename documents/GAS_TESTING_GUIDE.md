# GAS Testing Guide

This document provides comprehensive instructions for running and developing Google Apps Script (GAS) specific tests in the GAS App Framework.

## Overview

The framework provides two types of testing:

1. **Node.js Tests** (`test/node/`) - For business logic and unit testing
2. **GAS Tests** (`test/Modules/`) - For integration testing with GAS services and APIs

## GAS Test Structure

```
test/
├── Modules/                    # Module-specific GAS tests
│   ├── GAS/
│   │   └── gas_advanced_spec.ts       # Advanced GAS runtime features
│   ├── GasDI/
│   │   └── gas_di_spec.ts             # GAS-specific DI container tests
│   ├── Locking/
│   │   └── locking_spec.ts            # LockService integration tests
│   ├── Repository/
│   │   └── gas_spreadsheet_spec.ts    # SpreadsheetApp integration tests
│   ├── Routing/
│   │   └── routing_spec.ts            # URL routing tests
│   └── StringHelper/
│       └── stringhelper_spec.ts       # String utilities tests
├── shared/                     # Shared tests (both GAS and Node.js)
│   ├── stringhelper/
│   ├── routing/
│   ├── repository/
│   ├── locking/
│   └── gasdi/
└── node/                       # Node.js specific tests
    ├── shared/                 # Jest wrappers for shared tests
    └── integration/            # Complex integration tests
```


## Running GAS Tests

### Method 1: CLI Test Runner (Recommended)

The framework includes a web-based test runner integrated into the doGet handler.

1. **Build and Deploy**:
   ```bash
   # Build the webpack bundle
   npm run build
   
   # Push to GAS
   npm run gas:push
   
   # Deploy as web app
   npm run gas:deploy
   ```

2. **Run Tests via CLI**:
   ```bash
   # Run all tests
   npm run gas:test
   
   # Run specific category
   npm run gas:test -- --category=Repository
   
   # List test categories
   npm run gas:test -- --list
   ```

3. **View Test Results**:
   ```
   🧪 Running GAS Tests...
   📊 Test Results:

   Category: StringHelper
     ✅ formatString should format string with placeholders
     ✅ extractBetween should extract text between markers
     ✅ toHalfWidth should convert full-width to half-width
     ✅ slugify should create URL-friendly slugs

   Summary: 55 total, 9 passed, 46 failed
   ```

### Method 2: Web Browser

1. **Access the deployed web app URL**:
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

2. **Use query parameters**:
   - `?all=true` - Run all tests
   - `?category=StringHelper` - Run specific category
   - `?list=true` - List all test categories
   - `?format=json` - Get JSON format (for CLI)

### Method 3: GAS IDE (Manual)

For debugging individual tests:

1. **Open GAS Editor**:
   ```bash
   npm run gas:open
   ```

2. **Run test functions manually** in the script editor
   - Individual test files can be executed directly
   - Use Logger.log() to debug

### Method 4: clasp Command Line

For advanced users:

```bash
# Push latest changes
clasp push

# Run specific functions (if implemented)
clasp run <function_name>
```
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
T.it('Creates and manages ScriptApp triggers', () => {
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
- Routing and request handling

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

---

**Last Updated:** 2025-12-27
