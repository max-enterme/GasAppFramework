/**
 * GAS-Specific Integration Tests for Locking Module
 * 
 * These tests cover Locking functionality that relies on Google Apps Script
 * services including PropertiesService for distributed locking and LockService
 * for script-level locking operations.
 */

namespace Spec_Locking_GAS {

    T.it('GAS PropertiesStore handles property operations correctly', () => {
        // Test Case: PropertiesStore should use GAS PropertiesService for persistence
        TestHelpers.GAS.installAll();
        
        try {
            // Setup: Mock PropertiesService
            const mockProperties: { [key: string]: string } = {};
            (globalThis as any).PropertiesService = {
                getScriptProperties: () => ({
                    getProperty: (key: string) => mockProperties[key] || null,
                    setProperty: (key: string, value: string) => { mockProperties[key] = value; },
                    deleteProperty: (key: string) => { delete mockProperties[key]; }
                })
            };
            
            const store = new Locking.Adapters.GAS.PropertiesStore('test:');
            
            // Test: Set and get property
            store.set('resource1', 'lock-data-123');
            const retrieved = store.get('resource1');
            TAssert.equals(retrieved, 'lock-data-123', 'Should retrieve stored lock data');
            
            // Test: Get non-existent property returns null
            const missing = store.get('nonexistent');
            TAssert.isTrue(missing === null, 'Non-existent property should return null');
            
            // Test: Delete property
            store.del('resource1');
            const deleted = store.get('resource1');
            TAssert.isTrue(deleted === null, 'Deleted property should return null');
            
            // Test: Prefix is applied correctly
            store.set('test-key', 'test-value');
            TAssert.isTrue('test:test-key' in mockProperties, 'Prefix should be applied to key');
            TAssert.equals(mockProperties['test:test-key'], 'test-value', 'Value should be stored with prefix');

        } finally {
            delete (globalThis as any).PropertiesService;
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS distributed locking with PropertiesStore', () => {
        // Test Case: Complete distributed locking workflow using GAS PropertiesService
        TestHelpers.GAS.installAll();
        
        try {
            // Setup: Mock PropertiesService
            const mockProperties: { [key: string]: string } = {};
            (globalThis as any).PropertiesService = {
                getScriptProperties: () => ({
                    getProperty: (key: string) => mockProperties[key] || null,
                    setProperty: (key: string, value: string) => { mockProperties[key] = value; },
                    deleteProperty: (key: string) => { delete mockProperties[key]; }
                })
            };
            
            const store = new Locking.Adapters.GAS.PropertiesStore();
            const clock = new TestHelpers.Doubles.MockClock();
            const logger = new TestHelpers.Doubles.MockLogger();
            
            const lockEngine = Locking.Engine.create({
                store,
                clock,
                logger,
                namespace: 'gas-test:'
            });
            
            const resourceId = 'shared-resource';
            
            // Test: Acquire write lock
            const writeLock = lockEngine.acquire(resourceId, 'w', 'user1', 30000);
            TAssert.isTrue(!!writeLock, 'Should acquire write lock');
            TAssert.equals(writeLock!.mode, 'w', 'Lock mode should be write');
            TAssert.equals(writeLock!.owner, 'user1', 'Lock owner should be user1');
            
            // Test: Second write lock should fail
            const conflictingLock = lockEngine.acquire(resourceId, 'w', 'user2', 30000);
            TAssert.isTrue(conflictingLock === null, 'Conflicting write lock should fail');
            
            // Test: Release lock
            const released = lockEngine.release(resourceId, writeLock!.token);
            TAssert.isTrue(released, 'Should successfully release lock');
            
            // Test: After release, new lock should succeed
            const newLock = lockEngine.acquire(resourceId, 'r', 'user2', 30000);
            TAssert.isTrue(!!newLock, 'Should acquire new lock after release');

        } finally {
            delete (globalThis as any).PropertiesService;
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS LockService integration for script locking', () => {
        // Test Case: Integration with GAS LockService for script-level locking
        TestHelpers.GAS.installAll();
        
        try {
            const mockLockService = globalThis.LockService as TestHelpers.GAS.MockLockService;
            
            // Test: Script lock acquisition
            const scriptLock = mockLockService.getScriptLock();
            TAssert.isTrue(!!scriptLock, 'Should get script lock instance');
            
            // Test: Try to acquire lock with timeout
            const acquired = scriptLock.tryLock(5000);
            TAssert.isTrue(acquired, 'Should acquire script lock');
            TAssert.isTrue(scriptLock.hasLock(), 'Should confirm lock is held');
            
            // Test: Second lock attempt should fail
            const secondLock = mockLockService.getScriptLock();
            const secondAcquired = secondLock.tryLock(1000);
            TAssert.isTrue(!secondAcquired, 'Second lock attempt should fail');
            
            // Test: Release lock
            scriptLock.releaseLock();
            TAssert.isTrue(!scriptLock.hasLock(), 'Lock should be released');
            
            // Test: After release, new lock should succeed
            const thirdAcquired = secondLock.tryLock(1000);
            TAssert.isTrue(thirdAcquired, 'Lock should be acquirable after release');

        } finally {
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS lock timeout and expiration handling', () => {
        // Test Case: Lock timeout and expiration scenarios in GAS environment
        TestHelpers.GAS.installAll();
        
        try {
            // Setup: Mock PropertiesService and controlled clock
            const mockProperties: { [key: string]: string } = {};
            (globalThis as any).PropertiesService = {
                getScriptProperties: () => ({
                    getProperty: (key: string) => mockProperties[key] || null,
                    setProperty: (key: string, value: string) => { mockProperties[key] = value; },
                    deleteProperty: (key: string) => { delete mockProperties[key]; }
                })
            };
            
            const store = new Locking.Adapters.GAS.PropertiesStore();
            const mockClock = new TestHelpers.Doubles.MockClock(new Date(2024, 0, 15, 10, 0, 0));
            const logger = new TestHelpers.Doubles.MockLogger();
            
            const lockEngine = Locking.Engine.create({
                store,
                clock: mockClock,
                logger
            });
            
            const resourceId = 'timeout-test-resource';
            
            // Test: Acquire lock with short TTL
            const lock = lockEngine.acquire(resourceId, 'w', 'user1', 5000); // 5 second TTL
            TAssert.isTrue(!!lock, 'Should acquire lock with short TTL');
            
            // Test: Before expiration, lock should still block others
            mockClock.advance(3000); // Advance 3 seconds
            const blockedLock = lockEngine.acquire(resourceId, 'w', 'user2', 5000);
            TAssert.isTrue(blockedLock === null, 'Lock should still block before expiration');
            
            // Test: After expiration, lock should be available
            mockClock.advance(3000); // Advance 3 more seconds (total 6 seconds, past 5 second TTL)
            const expiredLock = lockEngine.acquire(resourceId, 'w', 'user2', 5000);
            TAssert.isTrue(!!expiredLock, 'Lock should be available after expiration');
            TAssert.equals(expiredLock!.owner, 'user2', 'New lock should have correct owner');

        } finally {
            delete (globalThis as any).PropertiesService;
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS lock error handling and recovery', () => {
        // Test Case: Error handling in GAS locking scenarios
        TestHelpers.GAS.installAll();
        
        try {
            // Setup: PropertiesService that can simulate errors
            let shouldThrowError = false;
            (globalThis as any).PropertiesService = {
                getScriptProperties: () => ({
                    getProperty: (key: string) => {
                        if (shouldThrowError) throw new Error('GAS Properties service error');
                        return null;
                    },
                    setProperty: (key: string, value: string) => {
                        if (shouldThrowError) throw new Error('GAS Properties service error');
                    },
                    deleteProperty: (key: string) => {
                        if (shouldThrowError) throw new Error('GAS Properties service error');
                    }
                })
            };
            
            const store = new Locking.Adapters.GAS.PropertiesStore();
            const clock = new TestHelpers.Doubles.MockClock();
            const logger = new TestHelpers.Doubles.MockLogger();
            
            const lockEngine = Locking.Engine.create({
                store,
                clock,
                logger
            });
            
            // Test: Normal operation works
            const normalLock = lockEngine.acquire('test-resource', 'r', 'user1', 30000);
            TAssert.isTrue(!!normalLock, 'Normal lock acquisition should work');
            
            // Test: Error during lock operation
            shouldThrowError = true;
            
            TAssert.throws(
                () => lockEngine.acquire('error-resource', 'w', 'user2', 30000),
                'Should throw error when PropertiesService fails'
            );
            
            // Verify error was logged
            TestHelpers.Assertions.assertLoggerContains(
                logger,
                'error',
                'Properties service error'
            );

        } finally {
            delete (globalThis as any).PropertiesService;
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS concurrent locking scenarios', () => {
        // Test Case: Simulated concurrent access scenarios in GAS
        TestHelpers.GAS.installAll();
        
        try {
            // Setup: Shared PropertiesService state
            const mockProperties: { [key: string]: string } = {};
            (globalThis as any).PropertiesService = {
                getScriptProperties: () => ({
                    getProperty: (key: string) => mockProperties[key] || null,
                    setProperty: (key: string, value: string) => { mockProperties[key] = value; },
                    deleteProperty: (key: string) => { delete mockProperties[key]; }
                })
            };
            
            const store = new Locking.Adapters.GAS.PropertiesStore();
            const clock = new TestHelpers.Doubles.MockClock();
            const logger = new TestHelpers.Doubles.MockLogger();
            
            // Create multiple lock engines (simulating different script executions)
            const lockEngine1 = Locking.Engine.create({ store, clock, logger });
            const lockEngine2 = Locking.Engine.create({ store, clock, logger });
            
            const resourceId = 'concurrent-resource';
            
            // Test: First engine acquires lock
            const lock1 = lockEngine1.acquire(resourceId, 'w', 'script1', 30000);
            TAssert.isTrue(!!lock1, 'First script should acquire lock');
            
            // Test: Second engine cannot acquire conflicting lock
            const lock2 = lockEngine2.acquire(resourceId, 'w', 'script2', 30000);
            TAssert.isTrue(lock2 === null, 'Second script should not acquire conflicting lock');
            
            // Test: First engine releases lock
            const released = lockEngine1.release(resourceId, lock1!.token);
            TAssert.isTrue(released, 'First script should release lock');
            
            // Test: Second engine can now acquire lock
            const lock3 = lockEngine2.acquire(resourceId, 'w', 'script2', 30000);
            TAssert.isTrue(!!lock3, 'Second script should acquire lock after release');
            TAssert.equals(lock3!.owner, 'script2', 'Lock should have correct owner');

        } finally {
            delete (globalThis as any).PropertiesService;
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('GAS read/write lock compatibility in distributed environment', () => {
        // Test Case: Read/write lock compatibility with GAS PropertiesService
        TestHelpers.GAS.installAll();
        
        try {
            // Setup: Shared PropertiesService state
            const mockProperties: { [key: string]: string } = {};
            (globalThis as any).PropertiesService = {
                getScriptProperties: () => ({
                    getProperty: (key: string) => mockProperties[key] || null,
                    setProperty: (key: string, value: string) => { mockProperties[key] = value; },
                    deleteProperty: (key: string) => { delete mockProperties[key]; }
                })
            };
            
            const store = new Locking.Adapters.GAS.PropertiesStore();
            const clock = new TestHelpers.Doubles.MockClock();
            const logger = new TestHelpers.Doubles.MockLogger();
            
            const lockEngine = Locking.Engine.create({ store, clock, logger });
            const resourceId = 'rw-test-resource';
            
            // Test: Multiple read locks should be compatible
            const readLock1 = lockEngine.acquire(resourceId, 'r', 'reader1', 30000);
            const readLock2 = lockEngine.acquire(resourceId, 'r', 'reader2', 30000);
            
            TAssert.isTrue(!!readLock1, 'First read lock should be acquired');
            TAssert.isTrue(!!readLock2, 'Second read lock should be compatible');
            
            // Test: Write lock should be blocked while read locks exist
            const writeLock1 = lockEngine.acquire(resourceId, 'w', 'writer1', 30000);
            TAssert.isTrue(writeLock1 === null, 'Write lock should be blocked by read locks');
            
            // Test: Release read locks
            lockEngine.release(resourceId, readLock1!.token);
            lockEngine.release(resourceId, readLock2!.token);
            
            // Test: Write lock should now succeed
            const writeLock2 = lockEngine.acquire(resourceId, 'w', 'writer1', 30000);
            TAssert.isTrue(!!writeLock2, 'Write lock should succeed after read locks released');
            
            // Test: No other locks should be possible while write lock exists
            const blockedRead = lockEngine.acquire(resourceId, 'r', 'reader3', 30000);
            const blockedWrite = lockEngine.acquire(resourceId, 'w', 'writer2', 30000);
            
            TAssert.isTrue(blockedRead === null, 'Read lock should be blocked by write lock');
            TAssert.isTrue(blockedWrite === null, 'Write lock should be blocked by existing write lock');

        } finally {
            delete (globalThis as any).PropertiesService;
            TestHelpers.GAS.resetAll();
        }
    });

    T.it('Complete GAS locking integration with real-world scenario', () => {
        // Test Case: Complete locking workflow for typical GAS use case (e.g., data processing job)
        TestHelpers.GAS.installAll();
        
        try {
            // Setup: Complete GAS environment with PropertiesService and LockService
            const mockProperties: { [key: string]: string } = {};
            (globalThis as any).PropertiesService = {
                getScriptProperties: () => ({
                    getProperty: (key: string) => mockProperties[key] || null,
                    setProperty: (key: string, value: string) => { mockProperties[key] = value; },
                    deleteProperty: (key: string) => { delete mockProperties[key]; }
                })
            };
            
            const distributedStore = new Locking.Adapters.GAS.PropertiesStore('job:');
            const clock = new TestHelpers.Doubles.MockClock();
            const logger = new TestHelpers.Doubles.MockLogger();
            
            const distributedLocking = Locking.Engine.create({
                store: distributedStore,
                clock,
                logger,
                namespace: 'data-job:'
            });
            
            // Scenario: Daily data processing job that should only run once
            const jobResourceId = 'daily-processing-2024-01-15';
            const jobTtl = 24 * 60 * 60 * 1000; // 24 hours
            
            // Test: First execution acquires distributed lock
            const jobLock = distributedLocking.acquire(jobResourceId, 'w', 'script-instance-1', jobTtl);
            TAssert.isTrue(!!jobLock, 'Job should acquire distributed lock on first execution');
            
            // Test: Concurrent execution is blocked
            const blockedExecution = distributedLocking.acquire(jobResourceId, 'w', 'script-instance-2', jobTtl);
            TAssert.isTrue(blockedExecution === null, 'Concurrent job execution should be blocked');
            
            // Test: Use GAS LockService for critical sections within the job
            const mockLockService = globalThis.LockService as TestHelpers.GAS.MockLockService;
            const scriptLock = mockLockService.getScriptLock();
            
            // Simulate critical section (e.g., updating shared configuration)
            scriptLock.waitLock(30000);
            TAssert.isTrue(scriptLock.hasLock(), 'Should acquire script lock for critical section');
            
            // Simulate some processing time
            clock.advance(5000);
            
            // Release script lock after critical section
            scriptLock.releaseLock();
            TAssert.isTrue(!scriptLock.hasLock(), 'Should release script lock after critical section');
            
            // Test: Job completes and releases distributed lock
            const jobCompleted = distributedLocking.release(jobResourceId, jobLock!.token);
            TAssert.isTrue(jobCompleted, 'Job should release distributed lock on completion');
            
            // Test: New job execution can now proceed
            const newJobExecution = distributedLocking.acquire(jobResourceId, 'w', 'script-instance-3', jobTtl);
            TAssert.isTrue(!!newJobExecution, 'New job execution should succeed after previous completion');
            
            // Verify logging
            TestHelpers.Assertions.assertLoggerContains(logger, 'info', 'acquired');

        } finally {
            delete (globalThis as any).PropertiesService;
            TestHelpers.GAS.resetAll();
        }
    });
}