/**
 * GAS Test Entry Points
 *
 * このファイルはGASエディタで実行するためのエントリポイント関数のみを含みます。
 * 実際のテストロジックは1_tests.jsバンドルに含まれています。
 *
 * このファイルはwebpackでバンドルされず、そのままGASにアップロードされます。
 */

/**
 * すべてのテストを実行
 * GASエディタから実行: test_RunAll()
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunAll() {
    const tests = (globalThis as any).GasAppFrameworkTests;
    if (!tests) {
        Logger.log('Error: GasAppFrameworkTests not found. Make sure 1_tests.js is loaded.');
        return;
    }

    const logger = (typeof Logger !== 'undefined') ? Logger : console;
    logger.log('\n📋 Running All Tests...\n');

    const results = tests.Runner.runAll();
    tests.GasReporter.print(results);
}

/**
 * カテゴリー別にテストを実行
 * GASエディタから実行: test_RunByCategory('GasDI')
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunByCategory(category: string) {
    const tests = (globalThis as any).GasAppFrameworkTests;
    if (!tests) {
        Logger.log('Error: GasAppFrameworkTests not found. Make sure 1_tests.js is loaded.');
        return;
    }

    const results = tests.Runner.runByCategory(category);
    tests.GasReporter.printCategory(results, category);
}

/**
 * 利用可能なテストカテゴリーを一覧表示
 * GASエディタから実行: test_ListCategories()
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_ListCategories() {
    const tests = (globalThis as any).GasAppFrameworkTests;
    if (!tests) {
        Logger.log('Error: GasAppFrameworkTests not found. Make sure 1_tests.js is loaded.');
        return;
    }

    const logger = (typeof Logger !== 'undefined') ? Logger : console;
    const categories = tests.Test.categories();

    logger.log(`\n📋 Available test categories (${categories.length}):`);
    categories.forEach((cat: string) => {
        const count = tests.Test.byCategory(cat).length;
        logger.log(`  📂 ${cat} (${count} tests)`);
    });

    logger.log(`\n💡 Usage examples:`);
    logger.log(`  test_RunAll()                    // Run all tests`);
    logger.log(`  test_RunByCategory('GasDI')     // Run GasDI tests only`);
    logger.log(`  test_ListCategories()            // Show this list`);
}

/**
 * フレームワークのバージョン情報を表示
 * GASエディタから実行: test_ShowVersion()
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_ShowVersion() {
    const versionInfo = (globalThis as any).__GAS_APP_VERSION__;
    if (!versionInfo) {
        Logger.log('Version information not available');
        return;
    }

    Logger.log('\n🏗️ GAS App Framework Version Info:');
    Logger.log('  Commit: ' + versionInfo.commitHash);
    Logger.log('  Branch: ' + versionInfo.branch);
    Logger.log('  Build Date: ' + versionInfo.buildDate);
}
