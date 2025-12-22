/**
 * GAS-Specific Test Support - Exports
 * 
 * This module provides GAS-specific test utilities including:
 * - GasReporter: Test result reporting for GAS environment
 * - TestHelpers: Mock implementations of GAS services, test doubles, and utilities
 * 
 * Usage in GAS projects:
 * ```typescript
 * import { GasReporter, TestHelpers } from 'gas-app-framework/testing/gas';
 * import { Runner } from 'gas-app-framework/testing/common';
 * 
 * // Run tests and report results
 * const results = Runner.runAll();
 * GasReporter.print(results);
 * 
 * // Use test helpers
 * const mockLogger = new TestHelpers.Doubles.MockLogger();
 * TestHelpers.GAS.installAll(); // Install GAS environment mocks
 * ```
 * 
 * @module testing/gas
 */

/// <reference path="./GasReporter.ts" />
/// <reference path="./TestHelpers.ts" />

/**
 * Export statement for module bundlers (placeholder for future ES module support)
 * Currently, GAS test utilities use namespace-based architecture for compatibility.
 */
export {};
