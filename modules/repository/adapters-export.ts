/**
 * Repository Adapters - Export wrapper for GAS compatibility
 */

import { MemoryStore } from './MemoryAdapter';
import { SpreadsheetStore } from './SpreadsheetAdapter';

export const Memory = {
    Store: MemoryStore
};

export const GAS = {
    SpreadsheetStore: SpreadsheetStore
};
