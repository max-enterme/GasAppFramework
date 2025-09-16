/**
 * GAS-Specific Integration Tests for Script Triggers and Properties
 * 
 * These tests cover Google Apps Script trigger management, script properties,
 * and advanced GAS runtime features like execution transcripts and quotas.
 */

namespace Spec_GAS_Advanced {

    T.it('GAS ScriptApp trigger management', () => {
        // Test Case: ScriptApp should manage time-based and event-based triggers
        TestHelpers.GAS.installAll();
        
        try {
            const mockScriptApp = globalThis.ScriptApp as TestHelpers.GAS.MockScriptApp;
            
            // Test: Create time-based trigger
            const trigger = mockScriptApp
                .newTrigger('dailyReport')
                .timeBased()
                .everyDays(1)
                .create();
            
            TAssert.equals(trigger.getHandlerFunction(), 'dailyReport', 'Trigger should have correct handler');
            TAssert.equals(trigger.getEventType(), 'TIME_DRIVEN', 'Trigger should be time-driven');
            
            // Test: List script triggers
            const triggers = mockScriptApp.getScriptTriggers();
            TAssert.equals(triggers.length, 1, 'Should have 1 trigger');
            TAssert.equals(triggers[0].getHandlerFunction(), 'dailyReport', 'Listed trigger should match created');
            
            // Test: Create hourly trigger
            const hourlyTrigger = mockScriptApp
                .newTrigger('hourlyCheck')
                .timeBased()
                .everyHours(2)
                .create();
            
            TAssert.equals(mockScriptApp.getScriptTriggers().length, 2, 'Should have 2 triggers');
            
            // Test: Delete trigger
            mockScriptApp.deleteTrigger(trigger);
            TAssert.equals(mockScriptApp.getScriptTriggers().length, 1, 'Should have 1 trigger after deletion');
            
            const remainingTrigger = mockScriptApp.getScriptTriggers()[0];
            TAssert.equals(remainingTrigger.getHandlerFunction(), 'hourlyCheck', 'Remaining trigger should be hourly');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS PropertiesService for application configuration', () => {
        // Test Case: PropertiesService should handle application configuration storage
        TestHelpers.GAS.installAll();
        
        try {
            // Setup: Mock PropertiesService
            const mockProperties: { [key: string]: string } = {};
            (globalThis as any).PropertiesService = {
                getScriptProperties: () => ({
                    getProperty: (key: string) => mockProperties[key] || null,
                    setProperty: (key: string, value: string) => { mockProperties[key] = value; },
                    deleteProperty: (key: string) => { delete mockProperties[key]; },
                    getProperties: () => ({ ...mockProperties }),
                    setProperties: (props: { [key: string]: string }) => {
                        Object.assign(mockProperties, props);
                    }
                }),
                getUserProperties: () => ({
                    getProperty: (key: string) => mockProperties[`user:${key}`] || null,
                    setProperty: (key: string, value: string) => { mockProperties[`user:${key}`] = value; }
                })
            };
            
            const scriptProps = (globalThis as any).PropertiesService.getScriptProperties();
            const userProps = (globalThis as any).PropertiesService.getUserProperties();
            
            // Test: Set and get script properties
            scriptProps.setProperty('app.version', '1.2.3');
            scriptProps.setProperty('app.environment', 'production');
            scriptProps.setProperty('database.url', 'https://sheets.google.com/abc123');
            
            TAssert.equals(scriptProps.getProperty('app.version'), '1.2.3', 'Should store app version');
            TAssert.equals(scriptProps.getProperty('app.environment'), 'production', 'Should store environment');
            
            // Test: Batch property operations
            scriptProps.setProperties({
                'cache.ttl': '3600',
                'retry.attempts': '3',
                'logging.level': 'INFO'
            });
            
            const allProps = scriptProps.getProperties();
            TAssert.equals(allProps['cache.ttl'], '3600', 'Batch properties should be set');
            TAssert.equals(allProps['retry.attempts'], '3', 'Multiple properties should be set');
            
            // Test: User-specific properties
            userProps.setProperty('timezone', 'Europe/London');
            userProps.setProperty('notifications', 'enabled');
            
            TAssert.equals(userProps.getProperty('timezone'), 'Europe/London', 'Should store user timezone');
            TAssert.equals(userProps.getProperty('notifications'), 'enabled', 'Should store user preferences');
            
            // Test: Property deletion
            scriptProps.deleteProperty('database.url');
            TAssert.isTrue(scriptProps.getProperty('database.url') === null, 'Deleted property should return null');

        } finally {
            delete (globalThis as any).PropertiesService;
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS execution context and user information', () => {
        // Test Case: Session service should provide execution context information
        TestHelpers.GAS.installAll();
        
        try {
            const mockSession = globalThis.Session as TestHelpers.GAS.MockSession;
            
            // Test: Script timezone
            TAssert.equals(mockSession.getScriptTimeZone(), 'America/New_York', 'Should have default timezone');
            
            mockSession.setTimeZone('Asia/Tokyo');
            TAssert.equals(mockSession.getScriptTimeZone(), 'Asia/Tokyo', 'Should update timezone');
            
            // Test: Active user information
            const activeUser = mockSession.getActiveUser();
            TAssert.equals(activeUser.getEmail(), 'test@example.com', 'Should have active user email');
            
            mockSession.setUserEmail('admin@company.com');
            TAssert.equals(mockSession.getActiveUser().getEmail(), 'admin@company.com', 'Should update user email');
            
            // Test: Timezone-aware operations
            const mockUtilities = globalThis.Utilities as TestHelpers.GAS.MockUtilities;
            const testDate = new Date('2024-01-15T10:30:00Z');
            
            const formattedDate = mockUtilities.formatDate(testDate, mockSession.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
            TAssert.isTrue(
                formattedDate.includes('2024-01-15') && formattedDate.includes('Asia/Tokyo'),
                'Date formatting should include timezone'
            );

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS error handling and logging integration', () => {
        // Test Case: Error handling should integrate with GAS Logger service
        TestHelpers.GAS.installAll();
        
        try {
            const mockLogger = globalThis.Logger as TestHelpers.GAS.MockLogger;
            
            // Test: Structured error logging
            function logError(error: Error, context: any) {
                const errorInfo = {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    context: context,
                    timestamp: new Date().toISOString()
                };
                
                mockLogger.log(`ERROR: ${JSON.stringify(errorInfo)}`);
            }
            
            const testError = new Error('Test error message');
            testError.name = 'TestError';
            
            logError(testError, { function: 'testFunction', userId: 'user123' });
            
            const lastLog = mockLogger.getLastLog();
            TAssert.isTrue(!!lastLog, 'Error should be logged');
            TAssert.isTrue(lastLog!.includes('Test error message'), 'Log should contain error message');
            TAssert.isTrue(lastLog!.includes('testFunction'), 'Log should contain context');
            
            // Test: Performance logging
            function logPerformance(operation: string, duration: number) {
                mockLogger.log(`PERF: ${operation} completed in ${duration}ms`);
            }
            
            logPerformance('data-processing', 1234);
            TAssert.isTrue(mockLogger.getLastLog()!.includes('data-processing completed in 1234ms'), 'Should log performance');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS quota and execution limit handling', () => {
        // Test Case: Application should handle GAS quotas and execution limits
        TestHelpers.GAS.installAll();
        
        try {
            const mockUtilities = globalThis.Utilities as TestHelpers.GAS.MockUtilities;
            const mockLogger = globalThis.Logger as TestHelpers.GAS.MockLogger;
            
            // Test: Simulate execution time monitoring
            function executeWithTimeLimit(operation: () => void, maxTimeMs: number) {
                const startTime = Date.now();
                
                try {
                    operation();
                    
                    const elapsed = Date.now() - startTime;
                    if (elapsed > maxTimeMs) {
                        throw new Error(`Operation exceeded time limit: ${elapsed}ms > ${maxTimeMs}ms`);
                    }
                    
                    mockLogger.log(`Operation completed in ${elapsed}ms`);
                    return true;
                } catch (error: any) {
                    mockLogger.log(`Operation failed: ${error.message}`);
                    return false;
                }
            }
            
            // Test: Fast operation should succeed
            const fastResult = executeWithTimeLimit(() => {
                // Simulate fast operation
                for (let i = 0; i < 100; i++) { /* no-op */ }
            }, 1000);
            
            TAssert.isTrue(fastResult, 'Fast operation should succeed');
            
            // Test: Use Utilities.sleep for pacing
            mockUtilities.sleep(100);
            TAssert.equals(mockUtilities.getLastSleepDuration(), 100, 'Should record sleep duration');
            
            // Test: Batch processing with checkpoints
            function processBatchWithCheckpoints(items: number[], batchSize: number) {
                const results: number[] = [];
                
                for (let i = 0; i < items.length; i += batchSize) {
                    const batch = items.slice(i, i + batchSize);
                    
                    // Process batch
                    batch.forEach(item => results.push(item * 2));
                    
                    // Checkpoint logging
                    mockLogger.log(`Processed batch ${Math.floor(i / batchSize) + 1}: items ${i + 1}-${Math.min(i + batchSize, items.length)}`);
                    
                    // Simulate brief pause between batches
                    if (i + batchSize < items.length) {
                        mockUtilities.sleep(10);
                    }
                }
                
                return results;
            }
            
            const testItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const processed = processBatchWithCheckpoints(testItems, 3);
            
            TAssert.equals(processed.length, 10, 'Should process all items');
            TAssert.equals(processed[0], 2, 'Items should be processed correctly');
            
            const logs = mockLogger.getAllLogs();
            TAssert.isTrue(logs.some(log => log.includes('Processed batch 1')), 'Should log batch progress');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS trigger-based workflow execution', () => {
        // Test Case: Complete workflow triggered by GAS time-based triggers
        TestHelpers.GAS.installAll();
        
        try {
            const mockScriptApp = globalThis.ScriptApp as TestHelpers.GAS.MockScriptApp;
            const mockLogger = globalThis.Logger as TestHelpers.GAS.MockLogger;
            const mockApp = globalThis.SpreadsheetApp as TestHelpers.GAS.MockSpreadsheetApp;
            
            // Setup: Workflow data spreadsheet
            mockApp.setupSpreadsheet('workflow-data', {
                'Tasks': [
                    ['id', 'name', 'status', 'lastRun'],
                    ['task1', 'Daily Report', 'pending', ''],
                    ['task2', 'Data Cleanup', 'pending', ''],
                    ['task3', 'Backup', 'pending', '']
                ]
            });
            
            // Setup: Mock workflow execution functions
            const workflowState = { executedTasks: [] as string[] };
            
            (globalThis as any).executeWorkflow = function() {
                try {
                    mockLogger.log('Workflow execution started');
                    
                    const sheet = mockApp.openById('workflow-data').getSheetByName('Tasks')!;
                    const tasks = sheet.getData().slice(1); // Skip header
                    
                    for (const task of tasks) {
                        const [id, name, status] = task;
                        
                        if (status === 'pending') {
                            // Simulate task execution
                            mockLogger.log(`Executing task: ${name}`);
                            workflowState.executedTasks.push(id);
                            
                            // Update task status (in real GAS, this would update the sheet)
                            task[2] = 'completed';
                            task[3] = new Date().toISOString();
                        }
                    }
                    
                    mockLogger.log(`Workflow completed. Executed ${workflowState.executedTasks.length} tasks`);
                    
                } catch (error: any) {
                    mockLogger.log(`Workflow failed: ${error.message}`);
                    throw error;
                }
            };
            
            // Test: Setup workflow trigger
            const workflowTrigger = mockScriptApp
                .newTrigger('executeWorkflow')
                .timeBased()
                .everyHours(6)
                .create();
            
            TAssert.equals(workflowTrigger.getHandlerFunction(), 'executeWorkflow', 'Trigger should target workflow function');
            
            // Test: Execute workflow (simulate trigger firing)
            (globalThis as any).executeWorkflow();
            
            // Verify workflow execution
            TAssert.equals(workflowState.executedTasks.length, 3, 'Should execute all pending tasks');
            TAssert.isTrue(workflowState.executedTasks.includes('task1'), 'Should execute task1');
            TAssert.isTrue(workflowState.executedTasks.includes('task2'), 'Should execute task2');
            TAssert.isTrue(workflowState.executedTasks.includes('task3'), 'Should execute task3');
            
            const logs = mockLogger.getAllLogs();
            TAssert.isTrue(logs.some(log => log.includes('Workflow execution started')), 'Should log workflow start');
            TAssert.isTrue(logs.some(log => log.includes('Executing task: Daily Report')), 'Should log task execution');
            TAssert.isTrue(logs.some(log => log.includes('Workflow completed')), 'Should log workflow completion');

        } finally {
            delete (globalThis as any).executeWorkflow;
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('Complete GAS application lifecycle management', () => {
        // Test Case: Full application lifecycle with initialization, execution, and cleanup
        TestHelpers.GAS.installAll();
        
        try {
            const mockScriptApp = globalThis.ScriptApp as TestHelpers.GAS.MockScriptApp;
            const mockLogger = globalThis.Logger as TestHelpers.GAS.MockLogger;
            const mockSession = globalThis.Session as TestHelpers.GAS.MockSession;
            
            // Setup: Application state tracking
            const appState = {
                initialized: false,
                version: '1.0.0',
                startTime: null as Date | null,
                lastActivity: null as Date | null,
                activeUsers: new Set<string>()
            };
            
            // Setup: Mock PropertiesService for app configuration
            const mockProperties: { [key: string]: string } = {};
            (globalThis as any).PropertiesService = {
                getScriptProperties: () => ({
                    getProperty: (key: string) => mockProperties[key] || null,
                    setProperty: (key: string, value: string) => { mockProperties[key] = value; },
                    getProperties: () => ({ ...mockProperties })
                })
            };
            
            // Define application lifecycle functions
            (globalThis as any).initializeApplication = function() {
                mockLogger.log('Initializing application...');
                
                const props = (globalThis as any).PropertiesService.getScriptProperties();
                
                // Set initial configuration
                props.setProperty('app.initialized', 'true');
                props.setProperty('app.version', appState.version);
                props.setProperty('app.timezone', mockSession.getScriptTimeZone());
                
                appState.initialized = true;
                appState.startTime = new Date();
                
                mockLogger.log(`Application initialized v${appState.version} in ${mockSession.getScriptTimeZone()}`);
                
                return { success: true, version: appState.version };
            };
            
            (globalThis as any).handleUserRequest = function(userEmail: string) {
                if (!appState.initialized) {
                    throw new Error('Application not initialized');
                }
                
                mockLogger.log(`Handling request from user: ${userEmail}`);
                
                appState.activeUsers.add(userEmail);
                appState.lastActivity = new Date();
                
                // Simulate request processing
                const requestId = `req-${Date.now()}`;
                mockLogger.log(`Request ${requestId} processed for ${userEmail}`);
                
                return { requestId, timestamp: appState.lastActivity };
            };
            
            (globalThis as any).cleanupApplication = function() {
                mockLogger.log('Starting application cleanup...');
                
                const props = (globalThis as any).PropertiesService.getScriptProperties();
                
                // Log final statistics
                const uptime = appState.startTime ? Date.now() - appState.startTime.getTime() : 0;
                mockLogger.log(`Application uptime: ${uptime}ms`);
                mockLogger.log(`Active users: ${appState.activeUsers.size}`);
                
                // Clean up triggers
                const triggers = mockScriptApp.getScriptTriggers();
                triggers.forEach(trigger => {
                    if (trigger.getHandlerFunction().startsWith('cleanup')) {
                        mockScriptApp.deleteTrigger(trigger);
                    }
                });
                
                // Update properties
                props.setProperty('app.shutdown', new Date().toISOString());
                
                mockLogger.log('Application cleanup completed');
                
                return { 
                    uptime, 
                    activeUsers: appState.activeUsers.size,
                    shutdownTime: new Date().toISOString() 
                };
            };
            
            // Test: Application lifecycle
            
            // 1. Initialize application
            const initResult = (globalThis as any).initializeApplication();
            TAssert.isTrue(initResult.success, 'Application should initialize successfully');
            TAssert.equals(initResult.version, '1.0.0', 'Should return correct version');
            
            // 2. Handle user requests
            const user1Result = (globalThis as any).handleUserRequest('alice@example.com');
            const user2Result = (globalThis as any).handleUserRequest('bob@example.com');
            
            TAssert.isTrue(!!user1Result.requestId, 'Should process user 1 request');
            TAssert.isTrue(!!user2Result.requestId, 'Should process user 2 request');
            TAssert.equals(appState.activeUsers.size, 2, 'Should track 2 active users');
            
            // 3. Setup cleanup trigger
            const cleanupTrigger = mockScriptApp
                .newTrigger('cleanupApplication')
                .timeBased()
                .everyDays(1)
                .create();
            
            TAssert.equals(cleanupTrigger.getHandlerFunction(), 'cleanupApplication', 'Cleanup trigger should be set');
            
            // 4. Perform cleanup (ensure some time has passed)
            // Add a small delay to ensure positive uptime
            const beforeCleanup = Date.now();
            if (appState.startTime && beforeCleanup - appState.startTime.getTime() === 0) {
                // Force a minimum 1ms uptime for test purposes
                appState.startTime = new Date(beforeCleanup - 1);
            }
            
            const cleanupResult = (globalThis as any).cleanupApplication();
            TAssert.equals(cleanupResult.activeUsers, 2, 'Cleanup should report active user count');
            TAssert.isTrue(cleanupResult.uptime > 0, 'Should report positive uptime');
            
            // Verify logging throughout lifecycle
            const logs = mockLogger.getAllLogs();
            TAssert.isTrue(logs.some(log => log.includes('Initializing application')), 'Should log initialization');
            TAssert.isTrue(logs.some(log => log.includes('Handling request from user: alice@example.com')), 'Should log user requests');
            TAssert.isTrue(logs.some(log => log.includes('Application cleanup completed')), 'Should log cleanup');
            
            // Verify properties were set
            const props = (globalThis as any).PropertiesService.getScriptProperties();
            TAssert.equals(props.getProperty('app.initialized'), 'true', 'Should set initialized flag');
            TAssert.equals(props.getProperty('app.version'), '1.0.0', 'Should store version');
            TAssert.isTrue(!!props.getProperty('app.shutdown'), 'Should record shutdown time');

        } finally {
            delete (globalThis as any).initializeApplication;
            delete (globalThis as any).handleUserRequest;
            delete (globalThis as any).cleanupApplication;
            delete (globalThis as any).PropertiesService;
            TestHelpers.GAS.resetAll();
        }
    });
}