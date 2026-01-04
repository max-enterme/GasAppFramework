/**
 * Testing Module - Entry Point
 */

export * as Test from './Test';
export * as Runner from './Runner';
export * as Assert from './Assert';
export * as GasReporter from './GasReporter';
export * as LogCapture from './LogCapture';

// Named exports for shared-tests compatibility
export { it, all, byCategory, categories, getCaseWithCategory, clear } from './Test';

// Export TestHelpers as a namespace
import * as TH from './TestHelpers';
export { TH as TestHelpers };

// Also export individual items for convenience
export { MockLogger, MockClock, Assertions, GAS } from './TestHelpers';
