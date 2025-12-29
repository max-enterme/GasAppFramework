/**
 * GAS Framework Initialization
 * This file must be loaded FIRST (hence the _ prefix for alphabetical ordering)
 * It makes the webpack bundle exports available to test files
 */

// This file is intentionally empty at build time
// The actual initialization code is in gas-main.ts which gets bundled into 0_main.js
// However, we need to ensure global exports are accessible

// Note: In GAS, all files share the same global scope
// The webpack bundle in 0_main.js should have already initialized everything
// via its initializeGasAppFramework() function which runs on load
