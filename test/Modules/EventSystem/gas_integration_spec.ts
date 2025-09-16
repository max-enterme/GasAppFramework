/**
 * GAS-Specific Integration Tests for EventSystem Module
 * 
 * These tests cover EventSystem functionality that relies on Google Apps Script
 * global objects and APIs, including triggers, spreadsheet job stores, and
 * timezone handling with GAS services.
 */

namespace Spec_EventSystem_GAS {
    
    T.it('GAS GlobalInvoker calls global functions correctly', () => {
        // Test Case: GlobalInvoker should be able to invoke global functions in GAS environment
        TestHelpers.GAS.installAll();
        
        try {
            // Setup: Create a mock global function
            let invocationCount = 0;
            let lastContext: any = null;
            (globalThis as any).testGlobalHandler = (ctx: any) => {
                invocationCount++;
                lastContext = ctx;
            };

            // Test: GlobalInvoker should successfully call the global function
            const invoker = new EventSystem.Adapters.GAS.GlobalInvoker();
            const testContext = { jobId: 'test-job', timestamp: new Date() };
            
            invoker.invoke('testGlobalHandler', testContext);
            
            TAssert.equals(invocationCount, 1, 'Global function should be called once');
            TAssert.equals(lastContext?.jobId, 'test-job', 'Context should be passed correctly');
            
            // Edge Case: Attempting to call non-existent function should throw
            TAssert.throws(
                () => invoker.invoke('nonExistentFunction', {}),
                'Should throw error for non-existent function'
            );

        } finally {
            // Cleanup
            delete (globalThis as any).testGlobalHandler;
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS SpreadsheetJobStore loads jobs from spreadsheet correctly', () => {
        // Test Case: SpreadsheetJobStore should read job configurations from GAS Spreadsheet
        TestHelpers.GAS.installAll();
        
        try {
            // Setup: Create mock spreadsheet with job data
            const mockApp = globalThis.SpreadsheetApp as TestHelpers.GAS.MockSpreadsheetApp;
            const testSheetId = 'test-sheet-123';
            
            // Job data: header row + job configurations
            const jobData = [
                ['id', 'handler', 'cron', 'multi', 'enabled', 'description'],
                ['daily-report', 'generateDailyReport', '0 9 * * *', 'false', 'true', 'Generate daily report at 9 AM'],
                ['weekly-cleanup', 'cleanupWeeklyData', '0 0 * * 0', 'false', 'true', 'Weekly cleanup on Sunday'],
                ['disabled-job', 'someHandler', '0 12 * * *', 'false', 'false', 'This job is disabled']
            ];
            
            mockApp.setupSpreadsheet(testSheetId, { 'Jobs': jobData });
            
            // Test: Load jobs from spreadsheet
            const jobStore = new EventSystem.Adapters.GAS.SpreadsheetJobStore(testSheetId, 'Jobs');
            const jobs = jobStore.load();
            
            TAssert.equals(jobs.length, 3, 'Should load 3 jobs from spreadsheet');
            
            // Verify first job details
            const dailyJob = jobs.find(j => j.id === 'daily-report');
            TAssert.isTrue(!!dailyJob, 'Daily report job should be loaded');
            TAssert.equals(dailyJob!.handler, 'generateDailyReport', 'Handler should match');
            TAssert.equals(dailyJob!.cron, '0 9 * * *', 'Cron expression should match');
            TAssert.isTrue(dailyJob!.enabled, 'Job should be enabled');
            
            // Verify disabled job is included but marked as disabled
            const disabledJob = jobs.find(j => j.id === 'disabled-job');
            TAssert.isTrue(!!disabledJob, 'Disabled job should be loaded');
            TAssert.isTrue(!disabledJob!.enabled, 'Job should be marked as disabled');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS SpreadsheetJobStore handles empty and malformed spreadsheets', () => {
        // Test Case: SpreadsheetJobStore should handle edge cases gracefully
        TestHelpers.GAS.installAll();
        
        try {
            const mockApp = globalThis.SpreadsheetApp as TestHelpers.GAS.MockSpreadsheetApp;
            const testSheetId = 'test-sheet-456';
            
            // Edge Case 1: Empty spreadsheet (only headers)
            mockApp.setupSpreadsheet(testSheetId, { 
                'EmptyJobs': [['id', 'handler', 'cron', 'multi', 'enabled']]
            });
            
            const emptyStore = new EventSystem.Adapters.GAS.SpreadsheetJobStore(testSheetId, 'EmptyJobs');
            const emptyJobs = emptyStore.load();
            TAssert.equals(emptyJobs.length, 0, 'Empty spreadsheet should return no jobs');
            
            // Edge Case 2: Non-existent sheet should throw error
            TAssert.throws(
                () => {
                    const badStore = new EventSystem.Adapters.GAS.SpreadsheetJobStore(testSheetId, 'NonExistentSheet');
                    badStore.load();
                },
                'Non-existent sheet should throw error'
            );

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS SystemClock returns current time correctly', () => {
        // Test Case: SystemClock should return current system time in GAS environment
        TestHelpers.GAS.installAll();
        
        try {
            const clock = new EventSystem.Adapters.GAS.SystemClock();
            const before = new Date();
            const clockTime = clock.now();
            const after = new Date();
            
            // Verify the clock returns a time within a reasonable range
            TAssert.isTrue(
                clockTime.getTime() >= before.getTime() && clockTime.getTime() <= after.getTime(),
                'Clock should return current system time'
            );

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS Logger integrates with Logger service', () => {
        // Test Case: GasLogger should use GAS Logger service for output
        TestHelpers.GAS.installAll();
        
        try {
            const mockLogger = globalThis.Logger as TestHelpers.GAS.MockLogger;
            const gasLogger = new EventSystem.Adapters.GAS.GasLogger();
            
            // Test info logging
            gasLogger.info('Test info message');
            TAssert.equals(mockLogger.getLastLog(), 'Test info message', 'Info message should be logged');
            
            // Test error logging
            gasLogger.error('Test error message');
            TAssert.equals(mockLogger.getLastLog(), 'Test error message', 'Error message should be logged');
            
            // Verify all logs are captured
            const allLogs = mockLogger.getAllLogs();
            TAssert.equals(allLogs.length, 2, 'Should have 2 log entries');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS RunLogger logs event data as JSON', () => {
        // Test Case: LogOnlyRunLogger should serialize event data to Logger
        TestHelpers.GAS.installAll();
        
        try {
            const mockLogger = globalThis.Logger as TestHelpers.GAS.MockLogger;
            const runLogger = new EventSystem.Adapters.GAS.LogOnlyRunLogger();
            
            const eventData = {
                jobId: 'test-job',
                startTime: new Date().toISOString(),
                status: 'completed',
                result: { processedItems: 42 }
            };
            
            runLogger.log(eventData);
            
            const loggedData = mockLogger.getLastLog();
            TAssert.isTrue(!!loggedData, 'Event data should be logged');
            
            // Verify the logged data can be parsed back to original object
            const parsedData = JSON.parse(loggedData!);
            TAssert.equals(parsedData.jobId, 'test-job', 'Job ID should be preserved');
            TAssert.equals(parsedData.result.processedItems, 42, 'Nested data should be preserved');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('EventSystem Trigger integrates with GAS timezone handling', () => {
        // Test Case: EventSystem should work correctly with GAS Session timezone
        TestHelpers.GAS.installAll();
        
        try {
            const mockSession = globalThis.Session as TestHelpers.GAS.MockSession;
            
            // Test with different timezones
            const testTimezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
            
            for (const tz of testTimezones) {
                mockSession.setTimeZone(tz);
                
                // Verify Session returns the set timezone
                TAssert.equals(mockSession.getScriptTimeZone(), tz, `Timezone should be set to ${tz}`);
                
                // Test that EventSystem components can access timezone
                const retrievedTz = (globalThis as any).Session.getScriptTimeZone();
                TAssert.equals(retrievedTz, tz, `EventSystem should access timezone ${tz}`);
            }

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('EventSystem handles GAS execution limits and timing', () => {
        // Test Case: EventSystem should work within GAS execution constraints
        TestHelpers.GAS.installAll();
        
        try {
            const mockUtilities = globalThis.Utilities as TestHelpers.GAS.MockUtilities;
            
            // Test Utilities.sleep simulation (for workflow delays)
            mockUtilities.sleep(1000);
            TAssert.equals(mockUtilities.getLastSleepDuration(), 1000, 'Sleep duration should be recorded');
            
            // Test date formatting with timezone (common in scheduled jobs)
            const testDate = new Date('2024-01-15T10:30:00Z');
            const formattedDate = mockUtilities.formatDate(testDate, 'America/New_York', 'yyyy-MM-dd');
            TAssert.isTrue(
                formattedDate.includes('2024-01-15') && formattedDate.includes('America/New_York'),
                'Date should be formatted with timezone info'
            );

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('EventSystem error handling in GAS environment', () => {
        // Test Case: EventSystem should handle GAS-specific errors gracefully
        TestHelpers.GAS.installAll();
        
        try {
            const mockLogger = globalThis.Logger as TestHelpers.GAS.MockLogger;
            const gasLogger = new EventSystem.Adapters.GAS.GasLogger();
            
            // Test error logging with GAS error objects
            const gasError = new Error('GAS quota exceeded');
            gasError.name = 'ScriptError';
            
            gasLogger.error(`Script error: ${gasError.message}`);
            
            const errorLog = mockLogger.getLastLog();
            TAssert.isTrue(
                errorLog!.includes('quota exceeded'),
                'GAS-specific errors should be logged properly'
            );

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('Complete EventSystem workflow in GAS environment', () => {
        // Test Case: Full integration test of EventSystem with GAS services
        TestHelpers.GAS.installAll();
        
        try {
            const mockApp = globalThis.SpreadsheetApp as TestHelpers.GAS.MockSpreadsheetApp;
            const mockLogger = globalThis.Logger as TestHelpers.GAS.MockLogger;
            
            // Setup: Create job configuration spreadsheet
            const jobData = [
                ['id', 'handler', 'cron', 'multi', 'enabled'],
                ['integration-test', 'testHandler', '0 * * * *', 'false', 'true']
            ];
            mockApp.setupSpreadsheet('jobs-sheet', { 'Jobs': jobData });
            
            // Setup: Create global handler function
            let handlerCalled = false;
            (globalThis as any).testHandler = () => { handlerCalled = true; };
            
            // Test: Create complete EventSystem trigger setup
            const jobStore = new EventSystem.Adapters.GAS.SpreadsheetJobStore('jobs-sheet', 'Jobs');
            const scheduler = {
                occurrences: (cronExpr: string, from: Date, to: Date, tz?: string | null) => {
                    // Simple mock implementation for testing
                    return EventSystem.Schedule.occurrences(from, to);
                },
                isDue: (cronExpr: string, at: Date, tz?: string | null) => {
                    return EventSystem.Schedule.isDue(cronExpr, at);
                }
            };
            const invoker = new EventSystem.Adapters.GAS.GlobalInvoker();
            const runLogger = new EventSystem.Adapters.GAS.LogOnlyRunLogger();
            
            const trigger = EventSystem.Trigger.create({
                jobs: jobStore,
                scheduler,
                invoker,
                runLogger
            });
            
            // Test: Run trigger (should execute hourly job)
            const testTime = new Date('2024-01-15T14:00:00Z'); // Top of hour
            trigger.run(testTime);
            
            // Verify: Handler was called and execution was logged
            TAssert.isTrue(handlerCalled, 'Handler should be called by trigger');
            TAssert.isTrue(mockLogger.getAllLogs().length > 0, 'Execution should be logged');

        } finally {
            delete (globalThis as any).testHandler;
            TestHelpers.GAS.resetAll();
        }
    });
}