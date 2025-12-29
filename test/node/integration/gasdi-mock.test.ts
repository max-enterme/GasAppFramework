/**
 * GasDI Mock Tests - Node.js Integration
 *
 * GAS Mockサービス（MockLogger, MockSpreadsheetApp, MockSession等）を使用したDIコンテナテスト。
 * これらのテストはNode.js環境で実行可能で、GASデプロイ不要。
 *
 * テスト対象:
 * - Container基本機能（register/resolve、lifetime管理）
 * - GASサービスとの統合（Mock使用）
 * - スコープ管理、エラーハンドリング、パフォーマンス
 *
 * 注: デコレータテストはwebpackタイミング問題により除外
 */

import { Container } from '../../../modules/di/Container';
import { MockLogger, GAS } from '../../../modules/testing-utils/test-utils';

describe('GasDI with GAS Mocks', () => {
    describe('Container Core Features', () => {
        test('register and resolve values/factories with lifetimes', () => {
            const c = new Container();
            c.registerValue('pi', 3.14);
            c.registerFactory('now', () => ({ t: Math.random() }), 'transient');
            c.registerFactory('cfg', () => ({ a: 1 }), 'singleton');

            const a = c.resolve<number>('pi');
            const n1 = c.resolve<{ t: number }>('now');
            const n2 = c.resolve<{ t: number }>('now');
            const g1 = c.resolve<{ a: number }>('cfg');
            const g2 = c.resolve<{ a: number }>('cfg');

            expect(a).toBe(3.14);
            expect(n1).not.toBe(n2); // transient: 毎回新しいインスタンス
            expect(g1).toBe(g2); // singleton: 同じインスタンス
        });

        test('scoped lifetime differs per scope', () => {
            const root = new Container();
            root.registerFactory('req', () => ({ id: Math.random() }), 'scoped');

            const s1 = root.createScope('req-1');
            const s2 = root.createScope('req-2');

            const a1 = s1.resolve<any>('req');
            const a2 = s1.resolve<any>('req');
            const b1 = s2.resolve<any>('req');

            expect(a1).toBe(a2); // 同じスコープ内は同じインスタンス
            expect(a1).not.toBe(b1); // 異なるスコープは別インスタンス
        });
    });

    describe('GAS Service Integration', () => {
        beforeEach(() => {
            GAS.installAll();
        });

        afterEach(() => {
            GAS.resetAll();
        });

        test('Container works with GAS global services', () => {
            const container = new Container();

            // GASサービスをコンテナに登録
            container.registerValue('SpreadsheetApp', globalThis.SpreadsheetApp);
            container.registerValue('Session', globalThis.Session);
            container.registerValue('Logger', globalThis.Logger);
            container.registerValue('LockService', globalThis.LockService);

            // コンテナから解決
            const spreadsheetApp = container.resolve('SpreadsheetApp') as typeof SpreadsheetApp;
            const session = container.resolve('Session') as typeof Session;
            const logger = container.resolve('Logger') as typeof Logger;
            const lockService = container.resolve('LockService') as typeof LockService;

            expect(spreadsheetApp).toBeTruthy();
            expect(session).toBeTruthy();
            expect(logger).toBeTruthy();
            expect(lockService).toBeTruthy();

            // Mock機能の確認
            expect(session.getScriptTimeZone()).toBe('America/New_York');

            const testSheet = spreadsheetApp.openById('test-id');
            expect(testSheet).toBeTruthy();
        });

        test('factory registration with GAS-specific dependencies', () => {
            const container = new Container();

            container.registerValue('SpreadsheetApp', globalThis.SpreadsheetApp);
            container.registerValue('Session', globalThis.Session);

            // GASサービスに依存するファクトリー登録
            container.registerFactory('UserRepository', () => {
                const app = container.resolve('SpreadsheetApp') as typeof SpreadsheetApp;
                const session = container.resolve('Session') as typeof Session;

                return {
                    spreadsheetApp: app,
                    currentUser: session.getActiveUser().getEmail(),
                    timezone: session.getScriptTimeZone(),

                    createUserSheet: function (sheetId: string) {
                        return this.spreadsheetApp.openById(sheetId);
                    }
                };
            }, 'singleton');

            const userRepo = container.resolve('UserRepository') as any;

            expect(userRepo).toBeTruthy();
            expect(userRepo.currentUser).toBe('test@example.com');
            expect(userRepo.timezone).toBe('America/New_York');

            // Singleton動作の確認
            const userRepo2 = container.resolve('UserRepository') as any;
            expect(userRepo).toBe(userRepo2);
        });

        test('scoped containers in GAS execution contexts', () => {
            const rootContainer = new Container();

            rootContainer.registerValue('Logger', globalThis.Logger);
            rootContainer.registerFactory('ExecutionContext', () => ({
                executionId: `exec-${Date.now()}-${Math.random()}`,
                startTime: new Date(),
                logger: rootContainer.resolve('Logger')
            }), 'scoped');

            // 異なる実行コンテキスト用のスコープ作成
            const requestScope1 = rootContainer.createScope('request-1');
            const requestScope2 = rootContainer.createScope('request-2');

            const ctx1 = requestScope1.resolve('ExecutionContext') as any;
            const ctx2 = requestScope2.resolve('ExecutionContext') as any;

            // 異なるスコープは異なるコンテキスト
            expect(ctx1).not.toBe(ctx2);
            expect(ctx1.executionId).not.toBe(ctx2.executionId);

            // 同じスコープ内は同じインスタンス
            const ctx1Again = requestScope1.resolve('ExecutionContext') as any;
            expect(ctx1).toBe(ctx1Again);

            // 共有Loggerへのアクセス
            expect(ctx1.logger).toBeTruthy();
            expect(ctx2.logger).toBeTruthy();
        });

        test('integration with EventSystem triggers', () => {
            const container = new Container();
            const mockLogger = globalThis.Logger as unknown as MockLogger;

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

            // トリガーハンドラーをDIで実装
            const triggerHandler = {
                handleDailyReport: function () {
                    const triggerLogger = container.resolve('TriggerLogger') as any;
                    triggerLogger.logTriggerStart('daily-report');

                    const report = { processed: 100, errors: 0 };

                    triggerLogger.logTriggerEnd('daily-report', report);
                    return report;
                }
            };

            const result = triggerHandler.handleDailyReport();
            expect(result.processed).toBe(100);

            const logs = mockLogger.getAllLogs();
            expect(logs.some(log => log.includes('Trigger daily-report started'))).toBe(true);
            expect(logs.some(log => log.includes('Trigger daily-report completed'))).toBe(true);
        });

        test('container with Repository pattern in GAS', () => {
            const container = new Container();
            const mockApp = globalThis.SpreadsheetApp as unknown as GAS.MockSpreadsheetApp;

            // テスト用スプレッドシート設定
            mockApp.setupSpreadsheet('user-data', {
                'Users': [
                    ['id', 'name', 'email'],
                    ['u1', 'Alice', 'alice@example.com'],
                    ['u2', 'Bob', 'bob@example.com']
                ]
            });

            container.registerValue('SpreadsheetApp', mockApp);
            container.registerValue('UserSheetId', 'user-data');

            container.registerFactory('UserRepository', () => {
                const app = container.resolve('SpreadsheetApp') as typeof SpreadsheetApp;
                const sheetId = container.resolve('UserSheetId') as string;

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

            const userRepo = container.resolve('UserRepository') as any;

            const alice = userRepo.findUser('u1');
            expect(alice).toBeTruthy();
            expect(alice!.name).toBe('Alice');
            expect(alice!.email).toBe('alice@example.com');

            const allUsers = userRepo.getAllUsers();
            expect(allUsers.length).toBe(2);
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            GAS.installAll();
        });

        afterEach(() => {
            GAS.resetAll();
        });

        test('error handling with GAS service failures', () => {
            const container = new Container();

            container.registerFactory('ProblematicService', () => {
                const session = (globalThis as any).Session;
                if (!session) {
                    throw new Error('GAS Session service not available');
                }

                return {
                    getTimeZone: () => session.getScriptTimeZone(),
                    isReady: true
                };
            }, 'singleton');

            // GASサービス利用可能時は正常動作
            const service1 = container.resolve('ProblematicService') as any;
            expect(service1.isReady).toBe(true);

            // GASサービス削除後は失敗
            delete (globalThis as any).Session;

            const newContainer = new Container();
            newContainer.registerFactory('ProblematicService', () => {
                const session = (globalThis as any).Session;
                if (!session) {
                    throw new Error('GAS Session service not available');
                }

                return {
                    getTimeZone: () => session.getScriptTimeZone(),
                    isReady: true
                };
            }, 'singleton');

            expect(() => newContainer.resolve('ProblematicService')).toThrow(
                'GAS Session service not available'
            );

            // 復元
            GAS.MockSession.install();
        });

        test('circular dependency detection in GAS context', () => {
            const container = new Container();

            container.registerFactory('ServiceA', () => {
                return {
                    name: 'ServiceA',
                    serviceB: container.resolve('ServiceB')
                };
            });

            container.registerFactory('ServiceB', () => {
                return {
                    name: 'ServiceB',
                    serviceA: container.resolve('ServiceA')
                };
            });

            expect(() => container.resolve('ServiceA')).toThrow();
        });
    });

    describe('Performance', () => {
        beforeEach(() => {
            GAS.installAll();
        });

        afterEach(() => {
            GAS.resetAll();
        });

        test('performance with GAS execution time limits', () => {
            const container = new Container();

            // 複数サービス登録
            for (let i = 0; i < 20; i++) {
                container.registerFactory(`Service${i}`, () => ({
                    id: i,
                    name: `Service ${i}`,
                    timestamp: new Date().getTime()
                }), 'transient');
            }

            const startTime = Date.now();
            const services = [];

            for (let i = 0; i < 20; i++) {
                services.push(container.resolve(`Service${i}`) as any);
            }

            const endTime = Date.now();
            const resolutionTime = endTime - startTime;

            expect(services.length).toBe(20);
            expect(resolutionTime).toBeLessThan(1000); // 1秒以内

            // Transient: 各インスタンスは一意
            const service0Again = container.resolve('Service0') as any;
            expect(services[0]).not.toBe(service0Again);
        });
    });

    describe('Complete Integration', () => {
        beforeEach(() => {
            GAS.installAll();
        });

        afterEach(() => {
            GAS.resetAll();
        });

        test('complete GasDI integration in GAS application workflow', () => {
            const container = new Container();
            const mockApp = globalThis.SpreadsheetApp as unknown as GAS.MockSpreadsheetApp;
            const mockLogger = globalThis.Logger as unknown as MockLogger;

            // アプリケーションデータ設定
            mockApp.setupSpreadsheet('app-config', {
                'Settings': [
                    ['key', 'value'],
                    ['app_name', 'GAS Test App'],
                    ['version', '1.0.0'],
                    ['environment', 'test']
                ]
            });

            // コアGASサービス登録
            container.registerValue('SpreadsheetApp', mockApp);
            container.registerValue('Logger', mockLogger);
            container.registerValue('Session', globalThis.Session);
            container.registerValue('ConfigSheetId', 'app-config');

            // アプリケーションサービス登録
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

            // DIを通じてアプリケーション初期化
            const appScope = container.createScope('app-execution');
            const appService = appScope.resolve('ApplicationService') as any;

            const appInfo = appService.initialize();

            expect(appInfo.name).toBe('GAS Test App');
            expect(appInfo.version).toBe('1.0.0');
            expect(appInfo.environment).toBe('test');
            expect(appInfo.timezone).toBe('America/New_York');

            // ロギング確認
            const logs = mockLogger.getAllLogs();
            expect(logs.some(log => log.includes('Starting GAS Test App'))).toBe(true);
            expect(logs.some(log => log.includes('Environment: test'))).toBe(true);
        });
    });
});
