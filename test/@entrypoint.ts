/**
 * Test Entry Point for webpack bundle
 * This file imports all test modules and makes them available in GAS environment
 * NOTE: This is bundled by webpack and does NOT contain entry point functions
 */

// Import test framework
import * as Framework from '../modules/index';

// Import test spec files (import/exportスタイル)
import './gas/di_spec';
import './gas/locking_spec';
import './gas/spreadsheet_spec';
import './gas/gas_advanced_spec';

// Import shared test cases (直接テスト登録される)
import './shared/gasdi/core.test';
import './shared/locking/core.test';
import './shared/routing/core.test';
import './shared/repository/core.test';
import './shared/stringhelper/core.test';

// Make Framework available globally for entry points
(globalThis as any).GasAppFrameworkTests = {
    Framework,
    Runner: Framework.Testing.Runner,
    GasReporter: Framework.Testing.GasReporter,
    Test: Framework.Testing.Test
};

// Export for webpack
export { };
