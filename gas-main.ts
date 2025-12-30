/**
 * Google Apps Script Entry Point
 * This file provides the doGet handler for web-based test execution
 */

import * as Framework from './modules/index';

// Initialize function - MUST be called before using the framework

function initializeGasAppFramework() {
    // Debug: Check Framework.Testing.TestHelpers before assigning
    const logger = (typeof Logger !== 'undefined') ? Logger : console;
    logger.log('[INIT] Framework.Testing.TestHelpers type: ' + typeof Framework.Testing.TestHelpers);
    logger.log('[INIT] Framework.Testing.TestHelpers keys: ' + Object.keys(Framework.Testing.TestHelpers).join(', '));
    if (Framework.Testing.TestHelpers.GAS) {
        logger.log('[INIT] Framework.Testing.TestHelpers.GAS type: ' + typeof Framework.Testing.TestHelpers.GAS);
        logger.log('[INIT] Framework.Testing.TestHelpers.GAS.installAll type: ' + typeof Framework.Testing.TestHelpers.GAS.installAll);
    }

    // Export framework and testing globals
    // These will be available when GAS loads test files
    (globalThis as any).GasAppFramework = Framework;
    (globalThis as any).T = Framework.Testing.Test;
    (globalThis as any).TRunner = Framework.Testing.Runner;
    (globalThis as any).TAssert = Framework.Testing.Assert;
    (globalThis as any).TGasReporter = Framework.Testing.GasReporter;
    (globalThis as any).testLog = Framework.Testing.LogCapture.testLog;

    // Export TestHelpers namespace
    (globalThis as any).TestHelpers = Framework.Testing.TestHelpers;

    // Debug: Check after assignment
    logger.log('[INIT] globalThis.TestHelpers type: ' + typeof (globalThis as any).TestHelpers);
    logger.log('[INIT] globalThis.TestHelpers.GAS type: ' + typeof (globalThis as any).TestHelpers.GAS);

    // Export common modules - use Framework object directly for better compatibility
    logger.log('[DEBUG] Framework.MemoryStore: ' + typeof Framework.MemoryStore);
    logger.log('[DEBUG] Framework.SpreadsheetStore: ' + typeof Framework.SpreadsheetStore);
    logger.log('[DEBUG] Framework.PropertiesStore: ' + typeof Framework.PropertiesStore);
    logger.log('[DEBUG] Framework.Repository: ' + typeof Framework.Repository);
    logger.log('[DEBUG] Framework.Repository.MemoryStore: ' + typeof Framework.Repository?.MemoryStore);
    logger.log('[DEBUG] Framework.Repository.Adapters: ' + typeof Framework.Repository?.Adapters);
    logger.log('[DEBUG] Framework.Repository.Adapters.Memory: ' + typeof Framework.Repository?.Adapters?.Memory);

    // Setup module aliases for test compatibility
    // These are set up here instead of test/@entrypoint.ts to ensure they're available
    // when test files are loaded (GAS loads files alphabetically)
    const RepositoryAdapters = Framework.Repository?.Adapters || {};
    const LockingAdapters = Framework.Locking?.Adapters || {};

    (globalThis as any).Repository = {
        ...Framework.Repository,
        MemoryStore: Framework.Repository?.MemoryStore || Framework.MemoryStore,
        SpreadsheetStore: Framework.Repository?.SpreadsheetStore || Framework.SpreadsheetStore,
        Engine: Framework.Repository?.Engine,
        Types: Framework.Repository?.Types,
        Codec: Framework.Repository?.Codec,
        SchemaFactory: Framework.Repository?.SchemaFactory,
        Adapters: {
            Memory: {
                Store: Framework.Repository?.MemoryStore || Framework.MemoryStore
            },
            GAS: {
                SpreadsheetStore: Framework.Repository?.SpreadsheetStore || Framework.SpreadsheetStore
            },
            ...RepositoryAdapters
        },
        Ports: Framework.Repository?.Types  // Alias for backward compatibility
    };

    (globalThis as any).Locking = {
        ...Framework.Locking,
        PropertiesStore: Framework.Locking?.PropertiesStore || Framework.PropertiesStore,
        SystemClock: Framework.Locking?.SystemClock || Framework.SystemClock,
        GasLogger: Framework.Locking?.GasLogger || Framework.GasLogger,
        Engine: Framework.Locking?.Engine,
        Types: Framework.Locking?.Types,
        Adapters: {
            GAS: {
                PropertiesStore: Framework.Locking?.PropertiesStore || Framework.PropertiesStore
            },
            ...LockingAdapters
        },
        Ports: Framework.Locking?.Types  // Alias for backward compatibility
    };

    (globalThis as any).Routing = Framework.Routing;
    (globalThis as any).StringHelper = Framework.StringHelper;
    (globalThis as any).Shared = Framework.Shared;

    // Log final structure
    logger.log('[INIT] Repository.MemoryStore: ' + typeof (globalThis as any).Repository.MemoryStore);
    logger.log('[INIT] Locking.PropertiesStore: ' + typeof (globalThis as any).Locking.PropertiesStore);
    // Export DI decorators and functions
    // CRITICAL: Use direct Container/Context class references bypassing webpack getters
    const GasAppFramework = (globalThis as any).GasAppFramework;

    // WORKAROUND: Webpack getters don't work correctly for Container/Context
    // Access the actual class through globalThis injection done in post-build
    let DIContainer: any;
    let DIContext: any;

    // Method 1: Try post-build injected globals (most reliable)
    if ((globalThis as any).__GasAppFramework_Container) {
        DIContainer = (globalThis as any).__GasAppFramework_Container;
        logger.log('[INIT] Using post-build Container');
    }
    // Method 2: Try webpack namespace (fallback)
    else if (GasAppFramework && GasAppFramework.Container) {
        DIContainer = GasAppFramework.Container;
        logger.log('[INIT] Using webpack Container');
    }

    // Same for Context
    if ((globalThis as any).__GasAppFramework_Context) {
        DIContext = (globalThis as any).__GasAppFramework_Context;
        logger.log('[INIT] Using post-build Context');
    }
    else if (GasAppFramework && GasAppFramework.Context) {
        DIContext = GasAppFramework.Context;
        logger.log('[INIT] Using webpack Context');
    }

    // DIInject and DIResolve with post-build fallback
    // CRITICAL: Webpack getters don't work for Inject/Resolve, ALWAYS use post-build globals
    // ONLY use post-build globals - webpack getters are broken
    const DIInject = (globalThis as any).__GasAppFramework_Inject;
    const DIResolve = (globalThis as any).__GasAppFramework_Resolve;

    if (DIInject) {
        logger.log('[INIT] Using post-build Inject');
    } else {
        logger.log('[WARN] Inject not found in post-build globals');
    }

    if (DIResolve) {
        logger.log('[INIT] Using post-build Resolve');
    } else {
        logger.log('[WARN] Resolve not found in post-build globals');
    }

    logger.log('[DEBUG] DIContainer: ' + (DIContainer ? 'found' : 'NOT FOUND'));
    logger.log('[DEBUG] DIContainer type: ' + typeof DIContainer);
    logger.log('[DEBUG] __GasAppFramework_Container type: ' + typeof (globalThis as any).__GasAppFramework_Container);
    logger.log('[DEBUG] DIInject type: ' + typeof DIInject);
    logger.log('[DEBUG] DIResolve type: ' + typeof DIResolve);
    logger.log('[DEBUG] __GasAppFramework_Inject type: ' + typeof (globalThis as any).__GasAppFramework_Inject);
    logger.log('[DEBUG] __GasAppFramework_Resolve type: ' + typeof (globalThis as any).__GasAppFramework_Resolve);

    // If Container still not found, throw error with debug info
    if (!DIContainer) {
        const debugInfo = {
            '__GasAppFramework_Container exists': !!(globalThis as any).__GasAppFramework_Container,
            '__GasAppFramework_Container type': typeof (globalThis as any).__GasAppFramework_Container,
            'GasAppFramework exists': !!GasAppFramework,
            'GasAppFramework.Container exists': !!(GasAppFramework && GasAppFramework.Container),
            'GasAppFramework.Container type': typeof (GasAppFramework && GasAppFramework.Container),
            'globalThis keys': Object.keys(globalThis).filter(k => k.includes('Gas') || k.includes('Container')).join(', ')
        };
        throw new Error('[CRITICAL] Container class not found! Debug: ' + JSON.stringify(debugInfo));
    }

    (globalThis as any).GasDI = {
        Container: DIContainer,
        Context: DIContext,
        Inject: DIInject,
        Resolve: DIResolve,
        Decorators: {
            Inject: DIInject,
            Resolve: DIResolve,
            Root: DIContainer && (DIContainer as any).Root
        }
    };

    // Log what was set
    logger.log('[INIT] GasDI.Inject type: ' + typeof (globalThis as any).GasDI.Inject);
    logger.log('[INIT] GasDI.Resolve type: ' + typeof (globalThis as any).GasDI.Resolve);
    logger.log('[INIT] GasDI.Decorators.Inject type: ' + typeof (globalThis as any).GasDI.Decorators.Inject);
    logger.log('[INIT] GasDI.Decorators.Resolve type: ' + typeof (globalThis as any).GasDI.Decorators.Resolve);

    // CRITICAL FIX: Ensure Container.Root is directly accessible on GasDI.Container
    // Some tests access it via GasDI.Container.Root
    if (DIContainer && (DIContainer as any).Root) {
        (globalThis as any).GasDI.Container.Root = (DIContainer as any).Root;
    }

    // Log final GasDI structure for verification
    logger.log('[INIT] GasDI.Container: ' + typeof (globalThis as any).GasDI.Container);
    logger.log('[INIT] GasDI.Container.Root: ' + typeof (globalThis as any).GasDI.Container.Root);
    logger.log('[INIT] GasDI.Context: ' + typeof (globalThis as any).GasDI.Context);


    // Make Container.Root available for decorator tests
    if ((globalThis as any).GasDI.Container && (DIContainer as any).Root) {
        (globalThis as any).GasDI.Container.Root = (DIContainer as any).Root;
    }

    // Export test utilities globally for easier access in tests
    (globalThis as any).MockLogger = Framework.Testing.MockLogger;
    (globalThis as any).MockClock = Framework.Testing.MockClock;

    logger.log('[INIT] GasDI.Container: ' + typeof (globalThis as any).GasDI.Container);
    logger.log('[INIT] GasDI.Container.name: ' + ((globalThis as any).GasDI.Container && (globalThis as any).GasDI.Container.name));
    logger.log('[INIT] MockClock: ' + typeof (globalThis as any).MockClock);
    logger.log('[INIT] MockLogger: ' + typeof (globalThis as any).MockLogger);
    logger.log('[INIT] Initialization complete');
}

// Auto-initialize on load
initializeGasAppFramework();

// Function to get debug info about Framework structure
function getFrameworkDebugInfo() {
    const Repository = (globalThis as any).Repository;
    const Locking = (globalThis as any).Locking;

    return {
        // Framework original structure
        'Framework.Repository': typeof Framework.Repository,
        'Framework.Repository keys': Framework.Repository ? Object.keys(Framework.Repository).join(', ') : 'undefined',
        'Framework.Repository.MemoryStore': typeof Framework.Repository?.MemoryStore,
        'Framework.Repository.Adapters': typeof Framework.Repository?.Adapters,
        'Framework.Repository.Adapters keys': Framework.Repository?.Adapters ? Object.keys(Framework.Repository.Adapters).join(', ') : 'undefined',
        'Framework.Repository.Adapters.Memory': typeof Framework.Repository?.Adapters?.Memory,
        'Framework.Repository.Adapters.Memory keys': Framework.Repository?.Adapters?.Memory ? Object.keys(Framework.Repository.Adapters.Memory).join(', ') : 'undefined',
        'Framework.Repository.Adapters.Memory.Store': typeof Framework.Repository?.Adapters?.Memory?.Store,

        'Framework.Locking': typeof Framework.Locking,
        'Framework.Locking keys': Framework.Locking ? Object.keys(Framework.Locking).join(', ') : 'undefined',
        'Framework.Locking.PropertiesStore': typeof Framework.Locking?.PropertiesStore,
        'Framework.Locking.Adapters': typeof Framework.Locking?.Adapters,
        'Framework.Locking.Adapters keys': Framework.Locking?.Adapters ? Object.keys(Framework.Locking.Adapters).join(', ') : 'undefined',

        // Global variables set by gas-main.ts
        'globalThis.Repository': typeof Repository,
        'globalThis.Repository keys': Repository ? Object.keys(Repository).join(', ') : 'undefined',
        'globalThis.Repository.MemoryStore': typeof Repository?.MemoryStore,
        'globalThis.Repository.Adapters': typeof Repository?.Adapters,
        'globalThis.Repository.Adapters keys': Repository?.Adapters ? Object.keys(Repository.Adapters).join(', ') : 'undefined',
        'globalThis.Repository.Adapters.Memory': typeof Repository?.Adapters?.Memory,
        'globalThis.Repository.Adapters.Memory.Store': typeof Repository?.Adapters?.Memory?.Store,

        'globalThis.Locking': typeof Locking,
        'globalThis.Locking keys': Locking ? Object.keys(Locking).join(', ') : 'undefined',
        'globalThis.Locking.PropertiesStore': typeof Locking?.PropertiesStore,
        'globalThis.Locking.Adapters': typeof Locking?.Adapters
    };
}

// Debug function to check if TestHelpers is loaded
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function debugTestHelpers() {
    const logger = (typeof Logger !== 'undefined') ? Logger : console;
    logger.log('=== TestHelpers Debug (from gas-main.ts) ===');
    logger.log('typeof TestHelpers: ' + typeof (globalThis as any).TestHelpers);
    logger.log('typeof Framework.Testing.TestHelpers: ' + typeof Framework.Testing.TestHelpers);
    if (typeof (globalThis as any).TestHelpers !== 'undefined') {
        logger.log('TestHelpers keys: ' + Object.keys((globalThis as any).TestHelpers).join(', '));
        logger.log('typeof TestHelpers.GAS: ' + typeof (globalThis as any).TestHelpers.GAS);
        if (typeof (globalThis as any).TestHelpers.GAS !== 'undefined') {
            logger.log('TestHelpers.GAS keys: ' + Object.keys((globalThis as any).TestHelpers.GAS).join(', '));
        }
    }
    logger.log('=========================================');
}

/**
 * Google Apps Script doGet handler
 * Provides web interface for test execution
 *
 * @param e - DoGet event parameter
 * @returns HTML or JSON output with test results
 *
 * @example
 * // Run all tests
 * https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
 *
 * // Run tests by category
 * https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?category=Repository
 *
 * // List all tests
 * https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?list=true
 *
 * // Get JSON output (for CLI)
 * https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?format=json
 *
 * // Debug Framework structure
 * https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?debug=true
 */
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
    // Debug mode: show detailed Framework structure as plain text
    if (e.parameter.debug === 'true') {
        const debugInfo = getFrameworkDebugInfo();
        let output = '=== GAS Framework Structure Debug Info ===\n\n';
        for (const [key, value] of Object.entries(debugInfo)) {
            output += `${key}: ${value}\n`;
        }
        return ContentService.createTextOutput(output)
            .setMimeType(ContentService.MimeType.TEXT);
    }

    // Create test runner with configuration
    const runner = new Framework.TestRunner.WebTestRunner({
        title: 'GasAppFramework Test Suite',
        baseUrl: ScriptApp.getService().getUrl(),
        showTiming: true,
        warningThreshold: 1000
    });

    // Handle the request
    return runner.handleRequest(e);
}

/**
 * Create a test deployment URL
 * Use this to get the web app URL for testing
 */
function getTestUrl(): string {
    return ScriptApp.getService().getUrl();
}

// Make doGet available globally
(globalThis as any).doGet = doGet;
(globalThis as any).getTestUrl = getTestUrl;
