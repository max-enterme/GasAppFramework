/**
 * Debug Test - Framework Structure Inspection
 *
 * This test verifies the structure of the GasAppFramework object after webpack bundling
 */

namespace Spec_Debug {
    T.it('Framework structure verification', () => {
        const Framework = (globalThis as any).GasAppFramework;
        const logger = (typeof Logger !== 'undefined') ? Logger : console;

        // Log version information
        const version = (globalThis as any).__GAS_APP_VERSION__;
        if (version) {
            logger.log('=== Version Information ===');
            logger.log('Commit: ' + version.commitShort + ' (' + version.branch + ')');
            logger.log('Commit Hash: ' + version.commitHash);
            logger.log('Commit Date: ' + version.commitDate);
            logger.log('Build Date: ' + version.buildDate);
            logger.log('===========================');
        }

        // Log Framework structure
        logger.log('=== Framework Structure Debug ===');
        logger.log('Framework.Repository: ' + typeof Framework.Repository);
        logger.log('Framework.Repository keys: ' + (Framework.Repository ? Object.keys(Framework.Repository).join(', ') : 'undefined'));
        logger.log('Framework.Repository.MemoryStore: ' + typeof Framework.Repository?.MemoryStore);
        logger.log('Framework.Repository.SpreadsheetStore: ' + typeof Framework.Repository?.SpreadsheetStore);
        logger.log('Framework.Repository.Adapters: ' + typeof Framework.Repository?.Adapters);

        if (Framework.Repository?.Adapters) {
            logger.log('Framework.Repository.Adapters keys: ' + Object.keys(Framework.Repository.Adapters).join(', '));
            logger.log('Framework.Repository.Adapters.Memory: ' + typeof Framework.Repository.Adapters.Memory);
            if (Framework.Repository.Adapters.Memory) {
                logger.log('Framework.Repository.Adapters.Memory keys: ' + Object.keys(Framework.Repository.Adapters.Memory).join(', '));
                logger.log('Framework.Repository.Adapters.Memory.Store: ' + typeof Framework.Repository.Adapters.Memory.Store);
            }
        }

        logger.log('Framework.Locking: ' + typeof Framework.Locking);
        logger.log('Framework.Locking keys: ' + (Framework.Locking ? Object.keys(Framework.Locking).join(', ') : 'undefined'));
        logger.log('Framework.Locking.PropertiesStore: ' + typeof Framework.Locking?.PropertiesStore);
        logger.log('Framework.Locking.Adapters: ' + typeof Framework.Locking?.Adapters);

        if (Framework.Locking?.Adapters) {
            logger.log('Framework.Locking.Adapters keys: ' + Object.keys(Framework.Locking.Adapters).join(', '));
        }

        logger.log('=================================');

        // Test passes if Framework exists
        TAssert.isTrue(typeof Framework !== 'undefined', 'Framework should exist');
    }, 'Debug');
}
