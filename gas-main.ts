/**
 * Google Apps Script Entry Point
 * This file provides the doGet handler for web-based test execution
 */

/// <reference path="./types/gas-globals.d.ts" />

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

    // Export TestHelpers namespace
    (globalThis as any).TestHelpers = Framework.Testing.TestHelpers;

    // Debug: Check after assignment
    logger.log('[INIT] globalThis.TestHelpers type: ' + typeof (globalThis as any).TestHelpers);
    logger.log('[INIT] globalThis.TestHelpers.GAS type: ' + typeof (globalThis as any).TestHelpers.GAS);

    // Export common modules for convenience
    logger.log('[DEBUG] Framework.MemoryStore: ' + typeof Framework.MemoryStore);
    logger.log('[DEBUG] Framework.SpreadsheetStore: ' + typeof Framework.SpreadsheetStore);
    logger.log('[DEBUG] Framework.PropertiesStore: ' + typeof Framework.PropertiesStore);
    
    const repository = Object.assign({}, Framework.Repository);
    repository.MemoryStore = Framework.MemoryStore;
    repository.SpreadsheetStore = Framework.SpreadsheetStore;
    (globalThis as any).Repository = repository;
    
    const locking = Object.assign({}, Framework.Locking);
    locking.PropertiesStore = Framework.PropertiesStore;
    locking.SystemClock = Framework.SystemClock;
    locking.GasLogger = Framework.GasLogger;
    (globalThis as any).Locking = locking;
    
    (globalThis as any).Routing = Framework.Routing;
    (globalThis as any).StringHelper = Framework.StringHelper;
    (globalThis as any).Shared = Framework.Shared;

    // Debug: Check exports structure
    logger.log('[DEBUG] globalThis.Locking.PropertiesStore: ' + typeof (globalThis as any).Locking.PropertiesStore);
    logger.log('[DEBUG] globalThis.Repository.MemoryStore: ' + typeof (globalThis as any).Repository.MemoryStore);
    logger.log('[DEBUG] globalThis.Repository.SpreadsheetStore: ' + typeof (globalThis as any).Repository.SpreadsheetStore);
    // Export DI decorators and functions
    (globalThis as any).GasDI = {
        Container: Framework.Container,
        Inject: Framework.Inject,
        Resolve: Framework.Resolve
    };

    // Export MockLogger for testing
    (globalThis as any).MockLogger = Framework.Testing.MockLogger;

    logger.log('[INIT] Initialization complete');
}

// Auto-initialize on load
initializeGasAppFramework();

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
 */
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput {
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
