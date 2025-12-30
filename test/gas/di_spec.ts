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

import * as Test from '@/testing/Test';
import * as Assert from '@/testing/Assert';
import * as TestHelpersModule from '@/testing/TestHelpers';
import * as Framework from '@/index';

// Get Container from Framework
const Container = Framework.Container;
const TestHelpers = TestHelpersModule;

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
