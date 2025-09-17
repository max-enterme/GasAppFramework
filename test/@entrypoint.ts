// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunAll() {
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
