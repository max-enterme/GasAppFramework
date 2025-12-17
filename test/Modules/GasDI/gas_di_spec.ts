/**
 * GasDI (Dependency Injection) Module Tests
 * 
 * These tests cover both core dependency injection functionality and GAS-specific
 * integration scenarios, including container scoping, lifecycle management, 
 * decorators, and integration with GAS global services and objects.
 */

namespace Spec_GasDI_GAS {

    T.it('register and resolve values/factories with lifetimes', () => {
        const c = new GasDI.Container();
        c.registerValue('pi', 3.14);
        c.registerFactory('now', () => ({ t: Math.random() }), 'transient');
        c.registerFactory('cfg', () => ({ a: 1 }), 'singleton');
        const a = c.resolve<number>('pi');
        const n1 = c.resolve<{ t: number }>('now');
        const n2 = c.resolve<{ t: number }>('now');
        const g1 = c.resolve<{ a: number }>('cfg');
        const g2 = c.resolve<{ a: number }>('cfg');
        TAssert.isTrue(a === 3.14, 'value ok');
        TAssert.isTrue(n1 !== n2, 'transient new each time');
        TAssert.isTrue(g1 === g2, 'singleton same instance');
    }, 'GasDI');

    T.it('scoped lifetime differs per scope', () => {
        const root = new GasDI.Container();
        root.registerFactory('req', () => ({ id: Math.random() }), 'scoped');
        const s1 = root.createScope('req-1');
        const s2 = root.createScope('req-2');
        const a1 = s1.resolve<any>('req');
        const a2 = s1.resolve<any>('req');
        const b1 = s2.resolve<any>('req');
        TAssert.isTrue(a1 === a2, 'same scope same instance');
        TAssert.isTrue(a1 !== b1, 'different scope different instance');
    }, 'GasDI');

    T.it('decorators: property and parameter injection with Root', () => {
        GasDI.Container.Root.registerValue('answer', 42);
        GasDI.Container.Root.registerFactory('svc', () => ({ hello() { return 'hi'; } }), 'singleton');

        @GasDI.Decorators.Resolve()
        class Demo {
            @GasDI.Decorators.Inject('answer') private a!: number;

            constructor(@GasDI.Decorators.Inject('svc') private s?: any) { }

            run(@GasDI.Decorators.Inject('answer') x?: number) {
                return { a: this.a, b: x, hi: this.s!.hello() };
            }
        }

        const d = new (Demo as any)() as any;
        const out = d.run();
        TAssert.equals(out.a, 42, 'property injected');
        TAssert.equals(out.b, 42, 'method param injected');
        TAssert.equals(out.hi, 'hi', 'constructor param injected');
    }, 'GasDI');

    T.it('optional injection does not throw when token missing', () => {
        @GasDI.Decorators.Resolve()
        class Foo { constructor(@GasDI.Decorators.Inject('missing', true) public x?: any) { } }
        const f = new (Foo as any)();
        TAssert.isTrue(f.x === undefined, 'optional param left undefined');
    }, 'GasDI');

    T.it('GasDI Container works with GAS global services', () => {
        // Test Case: Container should properly inject GAS services as dependencies
        TestHelpers.GAS.installAll();

        try {
            const container = new GasDI.Container();

            // Register GAS services in container
            container.registerValue('SpreadsheetApp', globalThis.SpreadsheetApp);
            container.registerValue('Session', globalThis.Session);
            container.registerValue('Logger', globalThis.Logger);
            container.registerValue('LockService', globalThis.LockService);

            // Test: Resolve GAS services from container
            const spreadsheetApp = container.resolve('SpreadsheetApp') as typeof SpreadsheetApp as typeof SpreadsheetApp;
            const session = container.resolve('Session') as typeof Session as typeof Session;
            const logger = container.resolve('Logger') as typeof Logger as typeof Logger;
            const lockService = container.resolve('LockService') as typeof LockService;

            TAssert.isTrue(!!spreadsheetApp, 'SpreadsheetApp should be resolved');
            TAssert.isTrue(!!session, 'Session should be resolved');
            TAssert.isTrue(!!logger, 'Logger should be resolved');
            TAssert.isTrue(!!lockService, 'LockService should be resolved');

            // Test: Resolved services are functional
            TAssert.equals(session.getScriptTimeZone(), 'America/New_York', 'Session service should work');

            const testSheet = spreadsheetApp.openById('test-id');
            TAssert.isTrue(!!testSheet, 'SpreadsheetApp should create spreadsheet objects');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    }, 'GasDI');

    T.it('GasDI factory registration with GAS-specific dependencies', () => {
        // Test Case: Factory functions should work with GAS service dependencies
        TestHelpers.GAS.installAll();

        try {
            const container = new GasDI.Container();

            // Register GAS services
            container.registerValue('SpreadsheetApp', globalThis.SpreadsheetApp);
            container.registerValue('Session', globalThis.Session);

            // Register factory that depends on GAS services
            container.registerFactory('UserRepository', () => {
                const app = container.resolve('SpreadsheetApp') as typeof SpreadsheetApp as typeof SpreadsheetApp;
                const session = container.resolve('Session') as typeof Session as typeof Session;

                return {
                    spreadsheetApp: app,
                    currentUser: session.getActiveUser().getEmail(),
                    timezone: session.getScriptTimeZone(),

                    createUserSheet: function (sheetId: string) {
                        return this.spreadsheetApp.openById(sheetId);
                    }
                };
            }, 'singleton');

            // Test: Resolve factory-created service
            const userRepo = container.resolve('UserRepository') as any;
            TAssert.isTrue(!!userRepo, 'UserRepository should be created');
            TAssert.equals(userRepo.currentUser, 'test@example.com', 'Should have current user email');
            TAssert.equals(userRepo.timezone, 'America/New_York', 'Should have timezone');

            // Test: Singleton behavior
            const userRepo2 = container.resolve('UserRepository') as any;
            TAssert.isTrue(userRepo === userRepo2, 'Singleton should return same instance');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    }, 'GasDI');

    T.it('GasDI scoped containers in GAS execution contexts', () => {
        // Test Case: Scoped containers should handle GAS execution context isolation
        TestHelpers.GAS.installAll();

        try {
            const rootContainer = new GasDI.Container();

            // Register shared GAS services at root level
            rootContainer.registerValue('Logger', globalThis.Logger);
            rootContainer.registerFactory('ExecutionContext', () => ({
                executionId: `exec-${Date.now()}-${Math.random()}`,
                startTime: new Date(),
                logger: rootContainer.resolve('Logger')
            }), 'scoped');

            // Create scoped containers for different execution contexts
            const requestScope1 = rootContainer.createScope('request-1');
            const requestScope2 = rootContainer.createScope('request-2');

            // Test: Each scope gets its own execution context
            const ctx1 = requestScope1.resolve('ExecutionContext') as any;
            const ctx2 = requestScope2.resolve('ExecutionContext') as any;

            TAssert.isTrue(ctx1 !== ctx2, 'Different scopes should have different contexts');
            TAssert.isTrue(ctx1.executionId !== ctx2.executionId, 'Execution IDs should be different');

            // Test: Within same scope, same instance is returned
            const ctx1Again = requestScope1.resolve('ExecutionContext') as any;
            TAssert.isTrue(ctx1 === ctx1Again, 'Same scope should return same instance');

            // Test: Both contexts can access shared Logger
            TAssert.isTrue(!!ctx1.logger, 'Context 1 should have logger');
            TAssert.isTrue(!!ctx2.logger, 'Context 2 should have logger');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    }, 'GasDI');

    T.it('GasDI integration with EventSystem triggers', () => {
        // Test Case: Container should integrate with EventSystem for trigger-based execution
        TestHelpers.GAS.installAll();

        try {
            const container = new GasDI.Container();
            const mockLogger = (globalThis.Logger as unknown) as TestHelpers.GAS.MockLogger;

            // Register EventSystem dependencies
            container.registerValue('Logger', mockLogger);
            container.registerFactory('TriggerLogger', () => {
                const logger = container.resolve('Logger') as typeof Logger;
                return {
                    logTriggerStart: (triggerId: string) => {
                        logger.log(`Trigger ${triggerId} started`);
                    },
                    logTriggerEnd: (triggerId: string, result: any) => {
                        logger.log(`Trigger ${triggerId} completed: ${JSON.stringify(result)}`);
                    }
                };
            }, 'transient');

            // Create trigger handler that uses DI
            const triggerHandler = {
                handleDailyReport: function () {
                    const triggerLogger = container.resolve('TriggerLogger') as any;
                    triggerLogger.logTriggerStart('daily-report');

                    // Simulate report generation
                    const report = { processed: 100, errors: 0 };

                    triggerLogger.logTriggerEnd('daily-report', report);
                    return report;
                }
            };

            // Test: Execute trigger handler
            const result = triggerHandler.handleDailyReport();
            TAssert.equals(result.processed, 100, 'Trigger should execute and return result');

            // Verify logging
            const logs = mockLogger.getAllLogs();
            TAssert.isTrue(logs.some(log => log.includes('Trigger daily-report started')), 'Should log trigger start');
            TAssert.isTrue(logs.some(log => log.includes('Trigger daily-report completed')), 'Should log trigger completion');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    }, 'GasDI');

    T.it('GasDI container with Repository pattern in GAS', () => {
        // Test Case: Container should support Repository pattern with GAS Spreadsheet backend
        TestHelpers.GAS.installAll();

        try {
            const container = new GasDI.Container();
            const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;

            // Setup test spreadsheet
            mockApp.setupSpreadsheet('user-data', {
                'Users': [
                    ['id', 'name', 'email'],
                    ['u1', 'Alice', 'alice@example.com'],
                    ['u2', 'Bob', 'bob@example.com']
                ]
            });

            // Register repository dependencies
            container.registerValue('SpreadsheetApp', mockApp);
            container.registerValue('UserSheetId', 'user-data');

            container.registerFactory('UserRepository', () => {
                const app = container.resolve('SpreadsheetApp') as typeof SpreadsheetApp;
                const sheetId = container.resolve('UserSheetId') as any;

                return {
                    findUser: function (userId: string) {
                        const sheet = app.openById(sheetId).getSheetByName('Users') as any;
                        const data = sheet!.getData();
                        const userRow = data.find((row: any) => row[0] === userId);

                        if (!userRow) return null;
                        return {
                            id: userRow[0],
                            name: userRow[1],
                            email: userRow[2]
                        };
                    },

                    getAllUsers: function () {
                        const sheet = app.openById(sheetId).getSheetByName('Users') as any;
                        const data = sheet!.getData();

                        return data.slice(1).map((row: any) => ({
                            id: row[0],
                            name: row[1],
                            email: row[2]
                        }));
                    }
                };
            }, 'singleton');

            // Test: Use repository through DI
            const userRepo = container.resolve('UserRepository') as any;

            const alice = userRepo.findUser('u1');
            TAssert.isTrue(!!alice, 'Should find user Alice');
            TAssert.equals(alice!.name, 'Alice', 'User name should match');
            TAssert.equals(alice!.email, 'alice@example.com', 'User email should match');

            const allUsers = userRepo.getAllUsers();
            TAssert.equals(allUsers.length, 2, 'Should find all users');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    }, 'GasDI');

    T.it('GasDI error handling with GAS service failures', () => {
        // Test Case: Container should handle GAS service failures gracefully
        TestHelpers.GAS.installAll();

        try {
            const container = new GasDI.Container();

            // Register factory that might fail due to GAS service issues
            container.registerFactory('ProblematicService', () => {
                // Simulate GAS service failure
                const session = (globalThis as any).Session;
                if (!session) {
                    throw new Error('GAS Session service not available');
                }

                return {
                    getTimeZone: () => session.getScriptTimeZone(),
                    isReady: true
                };
            }, 'singleton');

            // Test: Service works when GAS services are available
            const service1 = container.resolve('ProblematicService') as any;
            TAssert.isTrue(service1.isReady, 'Service should work with GAS services available');

            // Test: Service fails when GAS services are unavailable
            delete (globalThis as any).Session;

            // Create a new container to avoid caching issues
            const newContainer = new GasDI.Container();
            newContainer.registerFactory('ProblematicService', () => {
                // Simulate GAS service failure
                const session = (globalThis as any).Session;
                if (!session) {
                    throw new Error('GAS Session service not available');
                }

                return {
                    getTimeZone: () => session.getScriptTimeZone(),
                    isReady: true
                };
            }, 'singleton');

            TAssert.throws(
                () => newContainer.resolve('ProblematicService'),
                'Should throw error when GAS service is unavailable'
            );

        } finally {
            // Restore Session for cleanup
            TestHelpers.GAS.MockSession.install();
            TestHelpers.GAS.resetAll();
        }
    }, 'GasDI');

    T.it('GasDI circular dependency detection in GAS context', () => {
        // Test Case: Container should detect and handle circular dependencies
        TestHelpers.GAS.installAll();

        try {
            const container = new GasDI.Container();

            // Register services with circular dependency
            container.registerFactory('ServiceA', () => {
                return {
                    name: 'ServiceA',
                    serviceB: container.resolve('ServiceB') // Circular dependency
                };
            });

            container.registerFactory('ServiceB', () => {
                return {
                    name: 'ServiceB',
                    serviceA: container.resolve('ServiceA') // Circular dependency
                };
            });

            // Test: Circular dependency should be detected
            TAssert.throws(
                () => container.resolve('ServiceA'),
                'Circular dependency should throw error'
            );

        } finally {
            TestHelpers.GAS.resetAll();
        }
    }, 'GasDI');

    T.it('GasDI performance with GAS execution time limits', () => {
        // Test Case: Container should perform well within GAS execution constraints
        TestHelpers.GAS.installAll();

        try {
            const container = new GasDI.Container();

            // Register multiple services to test resolution performance
            for (let i = 0; i < 20; i++) {
                container.registerFactory(`Service${i}`, () => ({
                    id: i,
                    name: `Service ${i}`,
                    timestamp: new Date().getTime()
                }), 'transient');
            }

            // Test: Bulk resolution should complete quickly
            const startTime = Date.now();
            const services = [];

            for (let i = 0; i < 20; i++) {
                services.push(container.resolve(`Service${i}`) as any);
            }

            const endTime = Date.now();
            const resolutionTime = endTime - startTime;

            TAssert.equals(services.length, 20, 'Should resolve all services');
            TAssert.isTrue(resolutionTime < 1000, 'Resolution should be fast (< 1 second)');

            // Test: Each service is unique (transient lifetime)
            const service0Again = container.resolve('Service0') as any;
            TAssert.isTrue(services[0] !== service0Again, 'Transient services should be unique instances');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    }, 'GasDI');

    T.it('Complete GasDI integration in GAS application workflow', () => {
        // Test Case: Full integration test of GasDI in a typical GAS application
        TestHelpers.GAS.installAll();

        try {
            const container = new GasDI.Container();
            const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;
            const mockLogger = (globalThis.Logger as unknown) as TestHelpers.GAS.MockLogger;

            // Setup: Application data
            mockApp.setupSpreadsheet('app-config', {
                'Settings': [
                    ['key', 'value'],
                    ['app_name', 'GAS Test App'],
                    ['version', '1.0.0'],
                    ['environment', 'test']
                ]
            });

            // Register core GAS services
            container.registerValue('SpreadsheetApp', mockApp);
            container.registerValue('Logger', mockLogger);
            container.registerValue('Session', globalThis.Session);
            container.registerValue('ConfigSheetId', 'app-config');

            // Register application services
            container.registerFactory('ConfigService', () => {
                const app = container.resolve('SpreadsheetApp') as typeof SpreadsheetApp;
                const sheetId = container.resolve('ConfigSheetId') as string;

                return {
                    getConfig: function () {
                        const sheet = app.openById(sheetId).getSheetByName('Settings') as any;
                        const data = sheet!.getData();
                        const config: { [key: string]: string } = {};

                        data.slice(1).forEach((row: any) => {
                            config[row[0]] = row[1];
                        });

                        return config;
                    }
                };
            }, 'singleton');

            container.registerFactory('ApplicationService', () => {
                const configService = container.resolve('ConfigService') as any;
                const logger = container.resolve('Logger') as typeof Logger;
                const session = container.resolve('Session') as typeof Session;

                return {
                    initialize: function () {
                        const config = configService.getConfig();
                        logger.log(`Starting ${config.app_name} v${config.version}`);
                        logger.log(`Environment: ${config.environment}`);
                        logger.log(`Timezone: ${session.getScriptTimeZone()}`);

                        return {
                            name: config.app_name,
                            version: config.version,
                            environment: config.environment,
                            timezone: session.getScriptTimeZone()
                        };
                    }
                };
            }, 'scoped');

            // Test: Initialize application through DI
            const appScope = container.createScope('app-execution');
            const appService = appScope.resolve('ApplicationService') as any;

            const appInfo = appService.initialize();

            TAssert.equals(appInfo.name, 'GAS Test App', 'Should load app name from config');
            TAssert.equals(appInfo.version, '1.0.0', 'Should load version from config');
            TAssert.equals(appInfo.environment, 'test', 'Should load environment from config');
            TAssert.equals(appInfo.timezone, 'America/New_York', 'Should get timezone from Session');

            // Verify logging
            const logs = mockLogger.getAllLogs();
            TAssert.isTrue(logs.some(log => log.includes('Starting GAS Test App')), 'Should log app startup');
            TAssert.isTrue(logs.some(log => log.includes('Environment: test')), 'Should log environment');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    }, 'GasDI');
}
