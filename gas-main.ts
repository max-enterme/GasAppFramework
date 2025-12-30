/**
 * Google Apps Script Entry Point
 * This file provides the doGet handler for web-based test execution
 */

import * as Framework from './modules/index';

// Logger utility
const getLogger = () => (typeof Logger !== 'undefined') ? Logger : console;

/**
 * Setup framework globals for test compatibility
 */
function setupFrameworkGlobals(): void {
    const logger = getLogger();

    logger.log('[INIT] Framework.Testing.TestHelpers type: ' + typeof Framework.Testing.TestHelpers);

    (globalThis as any).GasAppFramework = Framework;
    (globalThis as any).T = Framework.Testing.Test;
    (globalThis as any).TRunner = Framework.Testing.Runner;
    (globalThis as any).TAssert = Framework.Testing.Assert;
    (globalThis as any).TGasReporter = Framework.Testing.GasReporter;
    (globalThis as any).testLog = Framework.Testing.LogCapture.testLog;
    (globalThis as any).TestHelpers = Framework.Testing.TestHelpers;
}

/**
 * Setup module aliases (Repository, Locking, etc.)
 */
function setupModuleAliases(): void {
    const logger = getLogger();

    // Repository module setup
    const RepositoryAdapters = Framework.Repository?.Adapters || {};
    (globalThis as any).Repository = {
        ...Framework.Repository,
        MemoryStore: Framework.Repository?.MemoryStore || Framework.MemoryStore,
        SpreadsheetStore: Framework.Repository?.SpreadsheetStore || Framework.SpreadsheetStore,
        Engine: Framework.Repository?.Engine,
        Types: Framework.Repository?.Types,
        Codec: Framework.Repository?.Codec,
        SchemaFactory: Framework.Repository?.SchemaFactory,
        Adapters: {
            Memory: { Store: Framework.Repository?.MemoryStore || Framework.MemoryStore },
            GAS: { SpreadsheetStore: Framework.Repository?.SpreadsheetStore || Framework.SpreadsheetStore },
            ...RepositoryAdapters
        },
        Ports: Framework.Repository?.Types
    };

    // Locking module setup
    const LockingAdapters = Framework.Locking?.Adapters || {};
    (globalThis as any).Locking = {
        ...Framework.Locking,
        PropertiesStore: Framework.Locking?.PropertiesStore || Framework.PropertiesStore,
        SystemClock: Framework.Locking?.SystemClock || Framework.SystemClock,
        GasLogger: Framework.Locking?.GasLogger || Framework.GasLogger,
        Engine: Framework.Locking?.Engine,
        Types: Framework.Locking?.Types,
        Adapters: {
            GAS: { PropertiesStore: Framework.Locking?.PropertiesStore || Framework.PropertiesStore },
            ...LockingAdapters
        },
        Ports: Framework.Locking?.Types
    };

    // Other modules
    (globalThis as any).Routing = Framework.Routing;
    (globalThis as any).StringHelper = Framework.StringHelper;
    (globalThis as any).Shared = Framework.Shared;

    logger.log('[INIT] Module aliases configured');
}

/**
 * Resolve DI components with fallback strategy
 */
function resolveDIComponents(): { Container: any; Context: any; Inject: any; Resolve: any } {
    const logger = getLogger();
    const postBuildContainer = (globalThis as any).__GasAppFramework_Container;
    const postBuildContext = (globalThis as any).__GasAppFramework_Context;
    const webpackFramework = (globalThis as any).GasAppFramework;

    // Container resolution
    const Container = postBuildContainer || webpackFramework?.Container;
    logger.log(`[INIT] Using ${postBuildContainer ? 'post-build' : 'webpack'} Container`);

    // Context resolution
    const Context = postBuildContext || webpackFramework?.Context;
    logger.log(`[INIT] Using ${postBuildContext ? 'post-build' : 'webpack'} Context`);

    // Inject/Resolve resolution (always prefer post-build)
    const Inject = (globalThis as any).__GasAppFramework_Inject;
    const Resolve = (globalThis as any).__GasAppFramework_Resolve;

    if (!Inject) logger.log('[WARN] Inject not found in post-build globals');
    if (!Resolve) logger.log('[WARN] Resolve not found in post-build globals');

    // Validate Container
    if (!Container) {
        const debugInfo = {
            '__GasAppFramework_Container exists': !!postBuildContainer,
            'GasAppFramework.Container exists': !!(webpackFramework?.Container),
            'globalThis keys': Object.keys(globalThis).filter(k => k.includes('Gas') || k.includes('Container')).join(', ')
        };
        throw new Error('[CRITICAL] Container class not found! Debug: ' + JSON.stringify(debugInfo));
    }

    return { Container, Context, Inject, Resolve };
}

/**
 * Setup DI system globals
 */
function setupDISystem(): void {
    const logger = getLogger();
    const { Container, Context, Inject, Resolve } = resolveDIComponents();

    (globalThis as any).GasDI = {
        Container,
        Context,
        Inject,
        Resolve,
        Decorators: {
            Inject,
            Resolve,
            Root: Container?.Root
        }
    };

    // Ensure Container.Root is accessible
    if (Container?.Root) {
        (globalThis as any).GasDI.Container.Root = Container.Root;
    }

    logger.log('[INIT] DI system configured');
}

/**
 * Setup test utility globals
 */
function setupTestUtilities(): void {
    const logger = getLogger();

    (globalThis as any).MockLogger = Framework.Testing.MockLogger;
    (globalThis as any).MockClock = Framework.Testing.MockClock;

    logger.log('[INIT] Test utilities configured');
}

/**
 * Initialize GAS App Framework
 * MUST be called before using the framework
 */
function initializeGasAppFramework(): void {
    const logger = getLogger();

    try {
        setupFrameworkGlobals();
        setupModuleAliases();
        setupDISystem();
        setupTestUtilities();

        logger.log('[INIT] Initialization complete');
    } catch (error) {
        logger.log('[ERROR] Initialization failed: ' + error);
        throw error;
    }
}

// Auto-initialize on load
initializeGasAppFramework();

/**
 * Get debug information about Framework structure
 */
function getFrameworkDebugInfo(): Record<string, string> {
    const Repository = (globalThis as any).Repository;
    const Locking = (globalThis as any).Locking;

    return {
        // Framework structure
        'Framework.Repository': typeof Framework.Repository,
        'Framework.Repository.MemoryStore': typeof Framework.Repository?.MemoryStore,
        'Framework.Repository.Adapters.Memory.Store': typeof Framework.Repository?.Adapters?.Memory?.Store,
        'Framework.Locking': typeof Framework.Locking,
        'Framework.Locking.PropertiesStore': typeof Framework.Locking?.PropertiesStore,

        // Global variables
        'globalThis.Repository': typeof Repository,
        'globalThis.Repository.MemoryStore': typeof Repository?.MemoryStore,
        'globalThis.Repository.Adapters.Memory.Store': typeof Repository?.Adapters?.Memory?.Store,
        'globalThis.Locking': typeof Locking,
        'globalThis.Locking.PropertiesStore': typeof Locking?.PropertiesStore
    };
}

/**
 * Google Apps Script doGet handler
 * Provides web interface for test execution
 */
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
    // Debug mode: show test registration count
    if (e.parameter.checkTests === 'true') {
        const testCount = Framework.Testing.Test.all().length;
        const categories = Framework.Testing.Test.categories();
        const output = [
            '=== Test Registration Check ===',
            ``,
            `Total registered tests: ${testCount}`,
            `Categories: ${categories.join(', ')}`,
            ``,
            `Framework.Testing available: ${!!Framework.Testing}`,
            `Framework.Testing.Test available: ${!!Framework.Testing.Test}`,
            `Test.all() type: ${typeof Framework.Testing.Test.all}`
        ].join('\n');

        return ContentService.createTextOutput(output)
            .setMimeType(ContentService.MimeType.TEXT);
    }

    // Debug mode: show detailed Framework structure
    if (e.parameter.debug === 'true') {
        const debugInfo = getFrameworkDebugInfo();
        const output = Object.entries(debugInfo)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        return ContentService.createTextOutput('=== GAS Framework Debug Info ===\n\n' + output)
            .setMimeType(ContentService.MimeType.TEXT);
    }

    // Create and run test runner
    const runner = new Framework.TestRunner.WebTestRunner({
        title: 'GasAppFramework Test Suite',
        baseUrl: ScriptApp.getService().getUrl(),
        showTiming: true,
        warningThreshold: 1000
    });

    return runner.handleRequest(e);
}

/**
 * Get the test deployment URL
 */
function getTestUrl(): string {
    return ScriptApp.getService().getUrl();
}

// Export global functions
(globalThis as any).doGet = doGet;
(globalThis as any).getTestUrl = getTestUrl;
