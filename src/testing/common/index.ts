/**
 * Common Test Framework - Exports
 * 
 * This module provides a lightweight test framework that works in both
 * GAS (Google Apps Script) and Node.js environments.
 * 
 * Usage in GAS projects:
 * ```typescript
 * import { Assert, Test, Runner } from 'gas-app-framework/testing/common';
 * 
 * Test.it('should work', () => {
 *   Assert.equals(1, 1);
 * });
 * 
 * const results = Runner.runAll();
 * ```
 * 
 * Usage in Node.js projects:
 * ```typescript
 * import { Assert, Test, Runner } from 'gas-app-framework/testing/common';
 * // Same API as GAS
 * ```
 * 
 * @module testing/common
 */

/// <reference path="./Assert.ts" />
/// <reference path="./Test.ts" />
/// <reference path="./Runner.ts" />

/**
 * Export statement for module bundlers (placeholder for future ES module support)
 * Currently, the test framework uses namespace-based architecture for GAS compatibility.
 */
export {};
