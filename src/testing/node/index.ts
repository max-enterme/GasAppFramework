/**
 * Node.js-Specific Test Support - Exports
 * 
 * This module provides Node.js-specific test utilities for testing the
 * GAS App Framework in a Node.js environment with Jest.
 * 
 * ⚠️ This module is NOT pushed to GAS projects - it's for local development only.
 * 
 * Usage in Node.js projects:
 * ```typescript
 * import { setupGASMocks, createMockLogger, createTestUser } from 'gas-app-framework/testing/node';
 * 
 * // Set up GAS environment mocks
 * beforeAll(() => {
 *   setupGASMocks();
 * });
 * 
 * // Create test data
 * const user = createTestUser({ name: 'Alice' });
 * const logger = createMockLogger();
 * ```
 * 
 * @module testing/node
 */

export { setupGASMocks, createMockLogger, createTestUser, createTestUsers } from './test-utils';
