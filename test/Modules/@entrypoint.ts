// @ts-nocheck
// Module-specific test entry points
// This file provides convenient functions for running tests by module category

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunByModule(moduleName: string) {
    const TRunner = (globalThis as any).TRunner;
    const TGasReporter = (globalThis as any).TGasReporter;

    // Run debug tests first to show Framework structure
    if (moduleName !== 'Debug') {
        const debugResults = TRunner.runByCategory('Debug');
        TGasReporter.printCategory(debugResults, 'Debug');
    }

    const results = TRunner.runByCategory(moduleName);
    TGasReporter.printCategory(results, moduleName);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_ShowAvailableModules() {
    const logger = (typeof Logger !== 'undefined') ? Logger : console;

    logger.log('\n🏗️ GAS App Framework - Module Test Entry Points');
    logger.log('================================================');

    const modules = [
        { name: 'EventSystem', description: 'Cron jobs, triggers, and workflows', tests: 'Trigger management, job scheduling, timezone handling' },
        { name: 'Repository', description: 'Data persistence with Google Sheets', tests: 'SpreadsheetApp integration, CRUD operations' },
        { name: 'Locking', description: 'Distributed locking mechanisms', tests: 'PropertiesService & LockService integration' },
        { name: 'GasDI', description: 'Dependency injection container', tests: 'Service injection, container scoping' },
        { name: 'GAS', description: 'Advanced GAS runtime features', tests: 'Script properties, execution limits, lifecycle' },
        { name: 'Routing', description: 'URL routing and request handling', tests: 'Route matching, middleware, dispatching' },
        { name: 'StringHelper', description: 'String templating and utilities', tests: 'Template formatting, string manipulation' }
    ];

    logger.log('\n📋 Available Modules:');
    modules.forEach(module => {
        logger.log(`  📂 ${module.name}`);
        logger.log(`     📄 ${module.description}`);
        logger.log(`     🧪 Tests: ${module.tests}`);
        logger.log('');
    });

    logger.log('💡 Usage Examples:');
    logger.log('  test_RunAll()                    // Run all tests with category grouping');
    logger.log('  test_RunByModule("EventSystem")  // Run only EventSystem tests');
    logger.log('  test_RunByModule("Repository")   // Run only Repository tests');
    logger.log('  test_ListCategories()            // List all available categories');
    logger.log('  test_ShowAvailableModules()      // Show this help');

    logger.log('\n🎯 Module-Specific Entry Points:');
    logger.log('  Available in each module folder:');
    logger.log('  📁 test/Modules/EventSystem/@entrypoint.ts  → test_RunEventSystem()');
    logger.log('  📁 test/Modules/Repository/@entrypoint.ts   → test_RunRepository()');
    logger.log('  📁 test/Modules/Locking/@entrypoint.ts      → test_RunLocking()');
    logger.log('  📁 test/Modules/GasDI/@entrypoint.ts        → test_RunGasDI()');
    logger.log('  📁 test/Modules/GAS/@entrypoint.ts          → test_RunGASAdvanced()');
}
