// Test entry point - verifies framework globals are properly set
// gas-main.ts should have already set up the global variables
function setupTestGlobals() {
    const Framework = (globalThis as any).GasAppFramework;
    if (!Framework) {
        throw new Error('GasAppFramework not found - gas-main.ts may not have loaded');
    }

    //  Repository and Locking globals are already set by gas-main.ts
    // Just verify they exist
    const Repository = (globalThis as any).Repository;
    const Locking = (globalThis as any).Locking;

    if (!Repository) {
        throw new Error('Repository global not found');
    }
    if (!Locking) {
        throw new Error('Locking global not found');
    }

    // Log for debugging (will appear in GAS logs)
    const logger = (typeof Logger !== 'undefined') ? Logger : console;
    logger.log('[TEST-ENTRY] Repository.Adapters: ' + typeof Repository.Adapters);
    if (Repository.Adapters) {
        logger.log('[TEST-ENTRY] Repository.Adapters.Memory: ' + typeof Repository.Adapters.Memory);
        if (Repository.Adapters.Memory) {
            logger.log('[TEST-ENTRY] Repository.Adapters.Memory.Store: ' + typeof Repository.Adapters.Memory.Store);
        }
    }
    logger.log('[TEST-ENTRY] Locking.PropertiesStore: ' + typeof Locking.PropertiesStore);

    // Set up additional globals if needed
    (globalThis as any).Shared = Framework.Shared;

    (globalThis as any).GasDI = {
        Container: Framework.Container,
        Inject: Framework.Inject,
        Resolve: Framework.Resolve
    };

    // Log setup completion
    logger.log('[TEST GLOBALS] Setup complete');
    logger.log('[TEST GLOBALS] Repository.MemoryStore: ' + typeof (globalThis as any).Repository.MemoryStore);
    logger.log('[TEST GLOBALS] Locking.PropertiesStore: ' + typeof (globalThis as any).Locking.PropertiesStore);
    logger.log('[TEST GLOBALS] TestHelpers.GAS: ' + typeof (globalThis as any).TestHelpers?.GAS);
}

// Run setup
try {
    setupTestGlobals();
} catch (e: any) {
    const logger = (typeof Logger !== 'undefined') ? Logger : console;
    logger.log('[TEST GLOBALS ERROR] ' + e.message);
}

// Check TestHelpers availability at module load time
try {
    if (typeof Logger !== 'undefined') {
        Logger.log('[TEST ENTRYPOINT] typeof TestHelpers: ' + typeof TestHelpers);
        Logger.log('[TEST ENTRYPOINT] typeof globalThis.TestHelpers: ' + typeof (globalThis as any).TestHelpers);
        if (typeof TestHelpers !== 'undefined' && TestHelpers.GAS) {
            Logger.log('[TEST ENTRYPOINT] TestHelpers.GAS.installAll exists: ' + (typeof TestHelpers.GAS.installAll === 'function'));
        }
    }
} catch (e: any) {
    if (typeof Logger !== 'undefined') {
        Logger.log('[TEST ENTRYPOINT] Error checking TestHelpers: ' + e.message);
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunAll() {
    // First run debug test to show Framework structure
    const logger = (typeof Logger !== 'undefined') ? Logger : console;
    logger.log('\n🔍 Running Framework Structure Debug Test First...\n');
    const debugResults = TRunner.runByCategory('Debug');
    TGasReporter.printCategory(debugResults, 'Debug');

    logger.log('\n\n📋 Running All Tests...\n');
    const results = TRunner.runAll();
    TGasReporter.print(results);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunByCategory(category: string) {
    const results = TRunner.runByCategory(category);
    TGasReporter.printCategory(results, category);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_ListCategories() {
    const categories = T.categories();
    const logger = (typeof Logger !== 'undefined') ? Logger : console;

    logger.log(`\n📋 Available test categories (${categories.length}):`);
    categories.forEach(cat => {
        const count = T.byCategory(cat).length;
        logger.log(`  📂 ${cat} (${count} tests)`);
    });

    logger.log(`\n💡 Usage examples:`);
    logger.log(`  test_RunAll()                    // Run all tests with category organization`);
    logger.log(`  test_RunByCategory('EventSystem') // Run EventSystem tests only`);
    logger.log(`  test_ListCategories()            // Show this list`);
    logger.log(`  test_ShowModuleHelp()            // Show module-specific entry points`);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_ShowModuleHelp() {
    const logger = (typeof Logger !== 'undefined') ? Logger : console;

    logger.log('\n🏗️ GAS App Framework - Module Test Organization');
    logger.log('===============================================');
    logger.log('\n🎯 Module-Specific Entry Points:');
    logger.log('  Each module has its own entry point file for focused testing:');
    logger.log('');
    logger.log('  📁 test/Modules/EventSystem/@entrypoint.ts');
    logger.log('     → test_RunEventSystem()     // Run EventSystem tests only');
    logger.log('     → test_RunEventSystemDemo() // Run demo tests with categories');
    logger.log('');
    logger.log('  📁 test/Modules/Repository/@entrypoint.ts');
    logger.log('     → test_RunRepository()      // Run Repository tests only');
    logger.log('     → test_RunRepositoryDemo()  // Run demo tests with categories');
    logger.log('');
    logger.log('  📁 test/Modules/Locking/@entrypoint.ts');
    logger.log('     → test_RunLocking()         // Run Locking tests only');
    logger.log('     → test_RunLockingDemo()     // Run demo tests with categories');
    logger.log('');
    logger.log('  📁 test/Modules/GasDI/@entrypoint.ts');
    logger.log('     → test_RunGasDI()           // Run GasDI tests only');
    logger.log('     → test_RunGasDIDemo()       // Run demo tests with categories');
    logger.log('');
    logger.log('  📁 test/Modules/GAS/@entrypoint.ts');
    logger.log('     → test_RunGASAdvanced()     // Run GAS Advanced tests only');
    logger.log('     → test_RunGASDemo()         // Run demo tests with categories');
    logger.log('');
    logger.log('💡 How to use in GAS IDE:');
    logger.log('  1. Deploy with: clasp push');
    logger.log('  2. In GAS IDE Script Editor, call any function:');
    logger.log('     - test_RunAll()              // All tests, organized by category');
    logger.log('     - test_RunEventSystem()      // Only EventSystem tests');
    logger.log('     - test_ListCategories()      // Show available categories');
    logger.log('     - test_ShowModuleHelp()      // Show this help');
}
