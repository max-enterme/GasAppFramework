/**
 * Locking - PropertiesStore & LockService Tests (Mock使用)
 * このテストはNode.js環境で実行可能
 */

import { MockLogger, MockClock } from '../../../modules/testing-utils/test-utils';
import { PropertiesStore } from '../../../modules/locking/Adapters';
import { create as createLockEngine } from '../../../modules/locking/Engine';

describe('Locking PropertiesStore with Mocks', () => {
    let mockProperties: { [key: string]: string };

    beforeEach(() => {
        mockProperties = {};

        // Setup Mock PropertiesService
        (globalThis as any).PropertiesService = {
            getScriptProperties: () => ({
                getProperty: (key: string) => mockProperties[key] || null,
                setProperty: (key: string, value: string) => { mockProperties[key] = value; },
                deleteProperty: (key: string) => { delete mockProperties[key]; }
            })
        };
    });

    afterEach(() => {
        delete (globalThis as any).PropertiesService;
    });

    test('PropertiesStore should handle basic operations', () => {
        const store = new PropertiesStore('test:');

        // Set and get
        store.set('resource1', 'lock-data-123');
        const retrieved = store.get('resource1');
        expect(retrieved).toBe('lock-data-123');

        // Get non-existent
        const missing = store.get('nonexistent');
        expect(missing).toBeNull();

        // Delete
        store.del('resource1');
        const deleted = store.get('resource1');
        expect(deleted).toBeNull();

        // Verify prefix is applied
        expect(mockProperties['test:resource1']).toBeUndefined();

        // Set without prefix check
        store.set('test-key', 'test-value');
        expect(mockProperties['test:test-key']).toBe('test-value');
    });

    test('Distributed locking with MockPropertiesService', () => {
        const store = new PropertiesStore();
        const clock = new MockClock();
        const logger = new MockLogger();

        const lockEngine = createLockEngine({
            store,
            clock,
            logger,
            namespace: 'gas-test:'
        });

        const resourceId = 'shared-resource';

        // Acquire write lock
        const writeLock = lockEngine.acquire(resourceId, 'w', 30000, 'user1');
        expect(writeLock.ok).toBe(true);
        if (!writeLock.ok) throw new Error('Should acquire');

        expect(writeLock.mode).toBe('w');
        expect(writeLock.owner).toBe('user1');

        // Second write lock should fail
        const conflictingLock = lockEngine.acquire(resourceId, 'w', 30000, 'user2');
        expect(conflictingLock.ok).toBe(false);

        // Release lock
        const released = lockEngine.release(resourceId, writeLock.token);
        expect(released.ok).toBe(true);

        // After release, new lock should succeed
        const newLock = lockEngine.acquire(resourceId, 'r', 30000, 'user2');
        expect(newLock.ok).toBe(true);
    });

    test('Lock timeout and expiration handling', () => {
        const store = new PropertiesStore();
        const mockClock = new MockClock(new Date(2024, 0, 15, 10, 0, 0));
        const logger = new MockLogger();

        const lockEngine = createLockEngine({
            store,
            clock: mockClock,
            logger
        });

        const resourceId = 'timeout-test-resource';

        // Acquire lock with short TTL
        const lock = lockEngine.acquire(resourceId, 'w', 5000, 'user1'); // 5 second TTL
        expect(lock.ok).toBe(true);

        // Before expiration, lock should still block others
        mockClock.advance(3000); // Advance 3 seconds
        const blockedLock = lockEngine.acquire(resourceId, 'w', 5000, 'user2');
        expect(blockedLock.ok).toBe(false);

        // After expiration, lock should be available
        mockClock.advance(3000); // Advance 3 more seconds (total 6 seconds, past 5 second TTL)
        const expiredLock = lockEngine.acquire(resourceId, 'w', 5000, 'user2');

        expect(expiredLock.ok).toBe(true);
        if (!expiredLock.ok) throw new Error('Lock should be available');
        expect(expiredLock.owner).toBe('user2');
    });

    test('Lock error handling with PropertiesService failures', () => {
        let shouldThrowError = false;
        (globalThis as any).PropertiesService = {
            getScriptProperties: () => ({
                getProperty: (_key: string) => {
                    if (shouldThrowError) throw new Error('GAS Properties service error');
                    return null;
                },
                setProperty: (_key: string, _value: string) => {
                    if (shouldThrowError) throw new Error('GAS Properties service error');
                },
                deleteProperty: (_key: string) => {
                    if (shouldThrowError) throw new Error('GAS Properties service error');
                }
            })
        };

        const store = new PropertiesStore();
        const clock = new MockClock();
        const logger = new MockLogger();

        const lockEngine = createLockEngine({
            store,
            clock,
            logger
        });

        // Normal operation works
        const normalLock = lockEngine.acquire('test-resource', 'r', 30000, 'user1');
        expect(normalLock.ok).toBe(true);

        // Error during lock operation
        shouldThrowError = true;

        expect(() => {
            lockEngine.acquire('error-resource', 'w', 30000, 'user2');
        }).toThrow('GAS Properties service error');

        // Verify error was logged
        expect(logger.contains('Properties service error', 'error')).toBe(true);
    });

    test('Concurrent locking scenarios', () => {
        const store = new PropertiesStore();
        const clock = new MockClock();
        const logger = new MockLogger();

        const lockEngine = createLockEngine({
            store,
            clock,
            logger
        });

        const resourceId = 'concurrent-resource';

        // Multiple readers can coexist
        const reader1 = lockEngine.acquire(resourceId, 'r', 30000, 'user1');
        const reader2 = lockEngine.acquire(resourceId, 'r', 30000, 'user2');
        const reader3 = lockEngine.acquire(resourceId, 'r', 30000, 'user3');

        expect(reader1.ok).toBe(true);
        expect(reader2.ok).toBe(true);
        expect(reader3.ok).toBe(true);

        // Writer should be blocked
        const writer = lockEngine.acquire(resourceId, 'w', 30000, 'user4');
        expect(writer.ok).toBe(false);

        // Release all readers
        if (reader1.ok) lockEngine.release(resourceId, reader1.token);
        if (reader2.ok) lockEngine.release(resourceId, reader2.token);
        if (reader3.ok) lockEngine.release(resourceId, reader3.token);

        // Now writer should succeed
        const writerRetry = lockEngine.acquire(resourceId, 'w', 30000, 'user4');
        expect(writerRetry.ok).toBe(true);
    });
});
