/**
 * Locking GAS固有テスト
 *
 * このファイルにはGAS環境でのみ実行されるテストを含みます:
 * - PropertiesService統合テスト
 * - LockService統合テスト
 * - GAS固有のタイムアウトとエラーハンドリング
 *
 * 共通ロジックテスト（両環境で実行）: test/shared/locking/core.test.ts
 */

import * as Test from '@/testing/Test';
import * as Assert from '@/testing/Assert';
import * as TestHelpers from '@/testing/TestHelpers';
import * as Locking from '@/locking';

// ============================================================================
// 注意: 以下の共通ロジックテストは test/shared/locking/core.test.ts に移動済み
// - Reader/Writerロックの取得・拒否ロジック
// - extend, release操作
// - 異なるドキュメントのロック独立性
// - タイムアウト処理
// - inspect機能
//
// このファイルにはGAS固有のテストのみを含みます
// ============================================================================

Test.it('GAS PropertiesStore handles property operations correctly', () => {
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

        const store = new Locking.PropertiesStore('test:');

        // Test: Set and get property
        store.set('resource1', 'lock-data-123');
        const retrieved = store.get('resource1');
        Assert.equals(retrieved, 'lock-data-123', 'Should retrieve stored lock data');

        // Test: Get non-existent property returns null
        const missing = store.get('nonexistent');
        Assert.isTrue(missing === null, 'Non-existent property should return null');

        // Test: Delete property
        store.del('resource1');
        const deleted = store.get('resource1');
        Assert.isTrue(deleted === null, 'Deleted property should return null');

        // Test: Prefix is applied correctly
        store.set('test-key', 'test-value');
        Assert.isTrue('test:test-key' in mockProperties, 'Prefix should be applied to key');
        Assert.equals(mockProperties['test:test-key'], 'test-value', 'Value should be stored with prefix');

    } finally {
        delete (globalThis as any).PropertiesService;
        TestHelpers.GAS.resetAll();
    }
}, 'Locking');

Test.it('GAS distributed locking with PropertiesStore', () => {
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

        const store = new Locking.PropertiesStore();
        const clock = new TestHelpers.MockClock();
        const logger = new TestHelpers.MockLogger();

        const lockEngine = Locking.Engine.create({
            store,
            clock,
            logger,
            namespace: 'gas-test:'
        });

        const resourceId = 'shared-resource';

        // Test: Acquire write lock
        const writeLock = lockEngine.acquire(resourceId, 'w', 30000, 'user1');

        if (!writeLock.ok)
            Assert.fail('Should acquire write lock');

        Assert.equals(writeLock.mode, 'w', 'Lock mode should be write');
        Assert.equals(writeLock.owner, 'user1', 'Lock owner should be user1');

        // Test: Second write lock should fail
        const conflictingLock = lockEngine.acquire(resourceId, 'w', 30000, 'user2');
        Assert.isTrue(!conflictingLock.ok, 'Conflicting write lock should fail');

        // Test: Release lock
        const released = lockEngine.release(resourceId, writeLock.token);
        Assert.isTrue(released.ok, 'Should successfully release lock');

        // Test: After release, new lock should succeed
        const newLock = lockEngine.acquire(resourceId, 'r', 30000, 'user2');
        Assert.isTrue(newLock.ok, 'Should acquire new lock after release');

    } finally {
        delete (globalThis as any).PropertiesService;
        TestHelpers.GAS.resetAll();
    }
}, 'Locking');

Test.it('GAS LockService integration for script locking', () => {
    // Test Case: Integration with GAS LockService for script-level locking
    TestHelpers.GAS.installAll();

    try {
        const mockLockService = globalThis.LockService as TestHelpers.GAS.MockLockService;

        // Test: Script lock acquisition
        const scriptLock = mockLockService.getScriptLock();
        Assert.isTrue(!!scriptLock, 'Should get script lock instance');

        // Test: Try to acquire lock with timeout
        const acquired = scriptLock.tryLock(5000);
        Assert.isTrue(acquired, 'Should acquire script lock');
        Assert.isTrue(scriptLock.hasLock(), 'Should confirm lock is held');

        // Test: Second lock attempt should fail
        const secondLock = mockLockService.getScriptLock();
        const secondAcquired = secondLock.tryLock(1000);
        Assert.isTrue(!secondAcquired, 'Second lock attempt should fail');

        // Test: Release lock
        scriptLock.releaseLock();
        Assert.isTrue(!scriptLock.hasLock(), 'Lock should be released');

        // Test: After release, new lock should succeed
        const thirdAcquired = secondLock.tryLock(1000);
        Assert.isTrue(thirdAcquired, 'Lock should be acquirable after release');

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Locking');

Test.it('GAS lock timeout and expiration handling', () => {
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

        const store = new Locking.PropertiesStore();
        const mockClock = new TestHelpers.MockClock(new Date(2024, 0, 15, 10, 0, 0));
        const logger = new TestHelpers.MockLogger();

        const lockEngine = Locking.Engine.create({
            store,
            clock: mockClock,
            logger
        });

        const resourceId = 'timeout-test-resource';

        // Test: Acquire lock with short TTL
        const lock = lockEngine.acquire(resourceId, 'w', 5000, 'user1'); // 5 second TTL
        Assert.isTrue(lock.ok, 'Should acquire lock with short TTL');

        // Test: Before expiration, lock should still block others
        mockClock.advance(3000); // Advance 3 seconds
        const blockedLock = lockEngine.acquire(resourceId, 'w', 5000, 'user2');
        Assert.isTrue(!blockedLock.ok, 'Lock should still block before expiration');

        // Test: After expiration, lock should be available
        mockClock.advance(3000); // Advance 3 more seconds (total 6 seconds, past 5 second TTL)
        const expiredLock = lockEngine.acquire(resourceId, 'w', 5000, 'user2');

        if (!expiredLock.ok)
            Assert.fail('Lock should be available after expiration');
        Assert.equals(expiredLock.owner, 'user2', 'New lock should have correct owner');

    } finally {
        delete (globalThis as any).PropertiesService;
        TestHelpers.GAS.resetAll();
    }
}, 'Locking');

Test.it('GAS lock error handling and recovery', () => {
    // Test Case: Error handling in GAS locking scenarios
    TestHelpers.GAS.installAll();

    try {
        // Setup: PropertiesService that can simulate errors
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

        const store = new Locking.PropertiesStore();
        const clock = new TestHelpers.MockClock();
        const logger = new TestHelpers.MockLogger();

        const lockEngine = Locking.Engine.create({
            store,
            clock,
            logger
        });

        // Test: Normal operation works
        const normalLock = lockEngine.acquire('test-resource', 'r', 30000, 'user1');
        Assert.isTrue(normalLock.ok, 'Normal lock acquisition should work');

        // Test: Error during lock operation
        shouldThrowError = true;

        Assert.throws(
            () => lockEngine.acquire('error-resource', 'w', 30000, 'user2'),
            'Should throw error when PropertiesService fails'
        );

        // Verify error was logged
        TestHelpers.Assertions.assertLoggerContains(
            logger,
            'Properties service error',
            'error'
        );

    } finally {
        delete (globalThis as any).PropertiesService;
        TestHelpers.GAS.resetAll();
    }
}, 'Locking');

Test.it('GAS concurrent locking scenarios', () => {
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

        const store = new Locking.PropertiesStore();
        const clock = new TestHelpers.MockClock();
        const logger = new TestHelpers.MockLogger();

        // Create multiple lock engines (simulating different script executions)
        const lockEngine1 = Locking.Engine.create({ store, clock, logger });
        const lockEngine2 = Locking.Engine.create({ store, clock, logger });

        const resourceId = 'concurrent-resource';

        // Test: First engine acquires lock
        const lock1 = lockEngine1.acquire(resourceId, 'w', 30000, 'script1');
        if (!lock1.ok)
            Assert.fail('First script should acquire lock');

        // Test: Second engine cannot acquire conflicting lock
        const lock2 = lockEngine2.acquire(resourceId, 'w', 30000, 'script2');
        Assert.isTrue(!lock2.ok, 'Second script should not acquire conflicting lock');

        // Test: First engine releases lock
        const released = lockEngine1.release(resourceId, lock1.token);
        Assert.isTrue(released.ok, 'First script should release lock');

        // Test: Second engine can now acquire lock
        const lock3 = lockEngine2.acquire(resourceId, 'w', 30000, 'script2');
        if (!lock3.ok)
            Assert.fail('Second script should acquire lock after release');
        Assert.equals(lock3.owner, 'script2', 'Lock should have correct owner');

    } finally {
        delete (globalThis as any).PropertiesService;
        TestHelpers.GAS.resetAll();
    }
}, 'Locking');

Test.it('GAS read/write lock compatibility in distributed environment', () => {
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

        const store = new Locking.PropertiesStore();
        const clock = new TestHelpers.MockClock();
        const logger = new TestHelpers.MockLogger();

        const lockEngine = Locking.Engine.create({ store, clock, logger });
        const resourceId = 'rw-test-resource';

        // Test: Multiple read locks should be compatible
        const readLock1 = lockEngine.acquire(resourceId, 'r', 30000, 'reader1');
        const readLock2 = lockEngine.acquire(resourceId, 'r', 30000, 'reader2');

        if (!readLock1.ok)
            Assert.fail('First read lock should be acquired');

        if (!readLock2.ok)
            Assert.fail('Second read lock should be compatible');

        // Test: Write lock should be blocked while read locks exist
        const writeLock1 = lockEngine.acquire(resourceId, 'w', 30000, 'writer1');
        Assert.isTrue(!writeLock1.ok, 'Write lock should be blocked by read locks');

        // Test: Release read locks
        lockEngine.release(resourceId, readLock1.token);
        lockEngine.release(resourceId, readLock2.token);

        // Test: Write lock should now succeed
        const writeLock2 = lockEngine.acquire(resourceId, 'w', 30, 'writer1');
        Assert.isTrue(writeLock2.ok, 'Write lock should succeed after read locks released');

        // Test: No other locks should be possible while write lock exists
        const blockedRead = lockEngine.acquire(resourceId, 'r', 30, 'reader3');
        const blockedWrite = lockEngine.acquire(resourceId, 'w', 30, 'writer2');

        Assert.isTrue(!blockedRead.ok, 'Read lock should be blocked by write lock');
        Assert.isTrue(!blockedWrite.ok, 'Write lock should be blocked by existing write lock');

    } finally {
        delete (globalThis as any).PropertiesService;
        TestHelpers.GAS.resetAll();
    }
}, 'Locking');

Test.it('Complete GAS locking integration with real-world scenario', () => {
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

        const distributedStore = new Locking.PropertiesStore('job:');
        const clock = new TestHelpers.MockClock();
        const logger = new TestHelpers.MockLogger();

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
        const jobLock = distributedLocking.acquire(jobResourceId, 'w', jobTtl, 'script-instance-1');
        if (!jobLock.ok)
            Assert.fail('Job should acquire distributed lock on first execution');

        // Test: Concurrent execution is blocked
        const blockedExecution = distributedLocking.acquire(jobResourceId, 'w', jobTtl, 'script-instance-2');
        Assert.isTrue(!blockedExecution.ok, 'Concurrent job execution should be blocked');

        // Test: Use GAS LockService for critical sections within the job
        const mockLockService = globalThis.LockService as TestHelpers.GAS.MockLockService;
        const scriptLock = mockLockService.getScriptLock();

        // Simulate critical section (e.g., updating shared configuration)
        scriptLock.waitLock(30000);
        Assert.isTrue(scriptLock.hasLock(), 'Should acquire script lock for critical section');

        // Simulate some processing time
        clock.advance(5000);

        // Release script lock after critical section
        scriptLock.releaseLock();
        Assert.isTrue(!scriptLock.hasLock(), 'Should release script lock after critical section');

        // Test: Job completes and releases distributed lock
        const jobCompleted = distributedLocking.release(jobResourceId, jobLock.token);
        Assert.isTrue(jobCompleted.ok, 'Job should release distributed lock on completion');

        // Test: New job execution can now proceed
        const newJobExecution = distributedLocking.acquire(jobResourceId, 'w', jobTtl, 'script-instance-3');
        Assert.isTrue(newJobExecution.ok, 'New job execution should succeed after previous completion');

        // Verify logging
        TestHelpers.Assertions.assertLoggerContains(logger, 'acquired', 'info');

    } finally {
        delete (globalThis as any).PropertiesService;
        TestHelpers.GAS.resetAll();
    }
}, 'Locking');
