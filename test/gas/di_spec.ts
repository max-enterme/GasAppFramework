/**
 * GasDI GAS固有テスト（import/exportスタイル版）
 *
 * このファイルにはGAS環境でのみ実行されるテストを含みます:
 * - TestHelpers.GAS.installAll()を使用するテスト
 * - MockSession, MockPropertiesServiceなどのGASモックを使用するテスト
 * - GAS固有のサービス統合テスト
 *
 * 共通ロジックテスト（両環境で実行）: test/shared/gasdi/core.test.ts
 */

import * as Test from '../../modules/testing/Test';
import * as Assert from '../../modules/testing/Assert';
import * as TestHelpersModule from '../../modules/testing/TestHelpers';
import * as Framework from '../../modules/index';

// Get Container from Framework
const Container = Framework.Container;
const TestHelpers = TestHelpersModule;

// 基本テスト
Test.it('register and resolve values/factories with lifetimes', () => {
    const c = new Container();
    c.registerValue('pi', 3.14);
    c.registerFactory('now', () => ({ t: Math.random() }), 'transient');
    c.registerFactory('cfg', () => ({ a: 1 }), 'singleton');
    const a = c.resolve<number>('pi');
    const n1 = c.resolve<{ t: number }>('now');
    const n2 = c.resolve<{ t: number }>('now');
    const g1 = c.resolve<{ a: number }>('cfg');
    const g2 = c.resolve<{ a: number }>('cfg');
    Assert.isTrue(a === 3.14, 'value ok');
    Assert.isTrue(n1 !== n2, 'transient new each time');
    Assert.isTrue(g1 === g2, 'singleton same instance');
}, 'GasDI');

Test.it('scoped lifetime differs per scope', () => {
    const root = new Container();
    root.registerFactory('req', () => ({ id: Math.random() }), 'scoped');
    const s1 = root.createScope('req-1');
    const s2 = root.createScope('req-2');
    const a1 = s1.resolve<any>('req');
    const a2 = s1.resolve<any>('req');
    const b1 = s2.resolve<any>('req');
    Assert.isTrue(a1 === a2, 'same scope same instance');
    Assert.isTrue(a1 !== b1, 'different scope different instance');
}, 'GasDI');

// GAS統合テスト
Test.it('GasDI Container works with GAS global services', () => {
    TestHelpers.GAS.installAll();

    try {
        const container = new Container();

        container.registerValue('SpreadsheetApp', globalThis.SpreadsheetApp);
        container.registerValue('Session', globalThis.Session);
        container.registerValue('Logger', globalThis.Logger);
        container.registerValue('LockService', globalThis.LockService);

        const spreadsheetApp = container.resolve('SpreadsheetApp');
        const session = container.resolve('Session') as typeof Session;
        const logger = container.resolve('Logger');
        const lockService = container.resolve('LockService');

        Assert.isTrue(!!spreadsheetApp, 'SpreadsheetApp should be resolved');
        Assert.isTrue(!!session, 'Session should be resolved');
        Assert.isTrue(!!logger, 'Logger should be resolved');
        Assert.isTrue(!!lockService, 'LockService should be resolved');

        Assert.equals(session.getScriptTimeZone(), 'America/New_York', 'Session service should work');

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'GasDI');

// エクスポート（webpackバンドル用）
export { };
