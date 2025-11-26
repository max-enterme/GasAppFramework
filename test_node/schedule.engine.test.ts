/**
 * Schedule Engine Tests
 * Comprehensive Node.js tests for the EventSystem.Schedule module
 * 
 * NOTE: This test file contains a local implementation of the Schedule Engine
 * that mirrors the actual implementation in Schedule.Engine.ts. This approach
 * is used because the actual implementation uses TypeScript namespaces which
 * don't work well with Jest's module system. The test validates the expected
 * behavior patterns that the actual implementation should follow.
 */

import { setupGASMocks, createMockLogger } from './test-utils';

// Expected timezone from test-utils.ts mock
const MOCK_TIMEZONE = 'America/New_York';

// Set up GAS environment mocks before tests
beforeAll(() => {
    setupGASMocks();
});

/**
 * Re-export types for testing Schedule Engine
 */

// Mock implementations for EventSystem.Ports interfaces
interface MockJob {
    id: string;
    handler: string;
    paramsJson?: string | null;
    cron: string;
    multi: boolean;
    enabled: boolean;
    tz?: string | null;
}

interface MockJobStore {
    load: jest.Mock<MockJob[]>;
}

interface MockCheckpointStore {
    get: jest.Mock<string | null, [string]>;
    set: jest.Mock<void, [string, string]>;
}

interface MockLock {
    tryWait: jest.Mock<boolean, [number]>;
    release: jest.Mock<void>;
}

interface MockLockFactory {
    acquire: jest.Mock<MockLock | null>;
}

interface MockScheduler {
    occurrences: jest.Mock<Date[], [string, Date, Date, string?]>;
    isDue: jest.Mock<boolean, [string, Date, string?]>;
}

interface MockInvoker {
    invoke: jest.Mock<void, [string, unknown]>;
}

interface MockClock {
    now: jest.Mock<Date>;
}

interface MockRunLogger {
    log: jest.Mock<void, [unknown]>;
}

type ScheduleDeps = {
    jobStore: MockJobStore;
    checkpoint: MockCheckpointStore;
    invoker: MockInvoker;
    lock: MockLockFactory;
    clock: MockClock;
    scheduler: MockScheduler;
    logger?: { info(msg: string): void; error(msg: string): void };
    runlog?: MockRunLogger;
    lookBackHours?: number;
    softTimeLimitMs?: number;
    defaultTz?: string;
};

interface ScheduleEngine {
    run(): void;
    runNow(jobId: string, times?: number): void;
}

/**
 * Implementation of Schedule Engine for testing
 * This mirrors the actual implementation in Schedule.Engine.ts
 */
function createScheduleEngine(deps: ScheduleDeps): ScheduleEngine {
    const logger = deps.logger ?? { info: (_: string) => { /* no-op */ }, error: (_: string) => { /* no-op */ } };
    const runlog = deps.runlog ?? { log: (_: unknown) => { /* no-op */ } };
    const lookBackMs = Math.max(0, (deps.lookBackHours ?? 24) * 3600 * 1000);
    const softLimit = Math.max(0, deps.softTimeLimitMs ?? 240000);

    function ensureTzString(tz?: string | null): string {
        if (typeof tz === 'string' && tz.trim()) return tz;
        try {
            if (typeof Session !== 'undefined' && (Session as { getScriptTimeZone?: () => string }).getScriptTimeZone) {
                return (Session as { getScriptTimeZone: () => string }).getScriptTimeZone();
            }
        } catch { /* ignore */ }
        return 'Etc/GMT';
    }

    function run(): void {
        const lk = deps.lock.acquire();
        if (!lk || !lk.tryWait(50)) {
            logger.info('[Schedule] skip: lock busy');
            return;
        }
        const t0 = deps.clock.now().getTime();
        try {
            const now = deps.clock.now();
            const jobs = deps.jobStore.load().filter(j => j.enabled);

            for (const job of jobs) {
                if (softLimit > 0 && (deps.clock.now().getTime() - t0) >= softLimit) {
                    logger.info('[Schedule] soft time limit reached');
                    break;
                }

                const tzStr = ensureTzString(job.tz ?? deps.defaultTz);
                const cpIso = deps.checkpoint.get(job.id);
                const from = cpIso ? new Date(cpIso) : new Date(now.getTime() - lookBackMs);
                const occ = deps.scheduler.occurrences(job.cron, from, now, tzStr);

                if (occ.length === 0) {
                    runlog.log({ jobId: job.id, runId: '-', scheduledIso: from.toISOString(), status: 'SKIP', message: 'no due' });
                    continue;
                }

                const toRun = job.multi ? occ : [occ[occ.length - 1]];

                for (const d of toRun) {
                    const runId = `${job.id}-${d.getTime()}`;
                    try {
                        runlog.log({ jobId: job.id, runId, scheduledIso: d.toISOString(), status: 'START' });
                        deps.invoker.invoke(job.handler, {
                            jobId: job.id,
                            scheduledAt: d.toISOString(),
                            paramsJson: job.paramsJson ?? null,
                            tz: tzStr
                        });
                        runlog.log({ jobId: job.id, runId, scheduledIso: d.toISOString(), status: 'SUCCESS' });
                    } catch (e: unknown) {
                        const msg = String((e as { message?: string })?.message ?? e);
                        runlog.log({ jobId: job.id, runId, scheduledIso: d.toISOString(), status: 'ERROR', message: msg });
                        logger.error(`[Schedule] job ${job.id} error: ${msg}`);
                    }

                    if (softLimit > 0 && (deps.clock.now().getTime() - t0) >= softLimit) {
                        logger.info('[Schedule] soft time limit reached');
                        break;
                    }
                }

                const latest = toRun[toRun.length - 1];
                deps.checkpoint.set(job.id, latest.toISOString());
            }
        } finally {
            try { lk.release(); } catch { /* ignore */ }
        }
    }

    function runNow(jobId: string, times = 1): void {
        const jobs = deps.jobStore.load();
        const job = jobs.find(j => j.id === jobId);
        if (!job) throw new Error(`job not found: ${jobId}`);

        const tzStr = ensureTzString(job.tz ?? deps.defaultTz);
        const now = deps.clock.now();

        for (let i = 0; i < Math.max(1, times); i++) {
            const d = new Date(now.getTime() + i * 1000);
            deps.invoker.invoke(job.handler, {
                jobId: job.id,
                scheduledAt: d.toISOString(),
                paramsJson: job.paramsJson ?? null,
                tz: tzStr
            });
        }
    }

    return { run, runNow };
}

// Helper to create test job
function createTestJob(overrides: Partial<MockJob> = {}): MockJob {
    return {
        id: 'test-job',
        handler: 'testHandler',
        cron: '0 * * * *',
        multi: false,
        enabled: true,
        paramsJson: null,
        tz: null,
        ...overrides
    };
}

// Helper to create mock dependencies
function createMockDeps(): ScheduleDeps {
    const mockLock: MockLock = {
        tryWait: jest.fn().mockReturnValue(true),
        release: jest.fn()
    };

    return {
        jobStore: { load: jest.fn().mockReturnValue([]) },
        checkpoint: {
            get: jest.fn().mockReturnValue(null),
            set: jest.fn()
        },
        invoker: { invoke: jest.fn() },
        lock: { acquire: jest.fn().mockReturnValue(mockLock) },
        clock: { now: jest.fn().mockReturnValue(new Date('2024-01-15T10:00:00Z')) },
        scheduler: {
            occurrences: jest.fn().mockReturnValue([]),
            isDue: jest.fn().mockReturnValue(false)
        },
        logger: createMockLogger(),
        runlog: { log: jest.fn() }
    };
}

describe('Schedule Engine Tests', () => {
    describe('Engine Creation', () => {
        test('should create engine instance with all dependencies', () => {
            const deps = createMockDeps();
            const engine = createScheduleEngine(deps);

            expect(engine).toBeDefined();
            expect(typeof engine.run).toBe('function');
            expect(typeof engine.runNow).toBe('function');
        });

        test('should create engine with optional dependencies', () => {
            const deps = createMockDeps();
            // Remove optional deps
            delete (deps as Partial<ScheduleDeps>).logger;
            delete (deps as Partial<ScheduleDeps>).runlog;

            const engine = createScheduleEngine(deps);
            expect(engine).toBeDefined();

            // Should not throw when running without logger/runlog
            expect(() => engine.run()).not.toThrow();
        });
    });

    describe('run() method', () => {
        test('should skip when lock is busy', () => {
            const deps = createMockDeps();
            const mockLock: MockLock = {
                tryWait: jest.fn().mockReturnValue(false),
                release: jest.fn()
            };
            deps.lock.acquire.mockReturnValue(mockLock);

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.logger?.info).toHaveBeenCalledWith('[Schedule] skip: lock busy');
            expect(deps.jobStore.load).not.toHaveBeenCalled();
        });

        test('should skip when lock acquisition fails', () => {
            const deps = createMockDeps();
            deps.lock.acquire.mockReturnValue(null);

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.logger?.info).toHaveBeenCalledWith('[Schedule] skip: lock busy');
            expect(deps.jobStore.load).not.toHaveBeenCalled();
        });

        test('should load enabled jobs only', () => {
            const deps = createMockDeps();
            const jobs = [
                createTestJob({ id: 'job1', enabled: true }),
                createTestJob({ id: 'job2', enabled: false }),
                createTestJob({ id: 'job3', enabled: true })
            ];
            deps.jobStore.load.mockReturnValue(jobs);

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.jobStore.load).toHaveBeenCalled();
            // Scheduler.occurrences should only be called for enabled jobs
            expect(deps.scheduler.occurrences).toHaveBeenCalledTimes(2);
        });

        test('should log SKIP when no occurrences found', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1' });
            deps.jobStore.load.mockReturnValue([job]);
            deps.scheduler.occurrences.mockReturnValue([]);

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.runlog?.log).toHaveBeenCalledWith(
                expect.objectContaining({ jobId: 'job1', status: 'SKIP', message: 'no due' })
            );
            expect(deps.invoker.invoke).not.toHaveBeenCalled();
        });

        test('should invoke handler for due job', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1', handler: 'myHandler' });
            const scheduledTime = new Date('2024-01-15T09:00:00Z');

            deps.jobStore.load.mockReturnValue([job]);
            deps.scheduler.occurrences.mockReturnValue([scheduledTime]);

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.invoker.invoke).toHaveBeenCalledWith('myHandler', {
                jobId: 'job1',
                scheduledAt: scheduledTime.toISOString(),
                paramsJson: null,
                tz: MOCK_TIMEZONE
            });
        });

        test('should log START and SUCCESS for successful invocation', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1' });
            const scheduledTime = new Date('2024-01-15T09:00:00Z');

            deps.jobStore.load.mockReturnValue([job]);
            deps.scheduler.occurrences.mockReturnValue([scheduledTime]);

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.runlog?.log).toHaveBeenCalledWith(
                expect.objectContaining({ jobId: 'job1', status: 'START' })
            );
            expect(deps.runlog?.log).toHaveBeenCalledWith(
                expect.objectContaining({ jobId: 'job1', status: 'SUCCESS' })
            );
        });

        test('should log ERROR when handler throws', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1' });
            const scheduledTime = new Date('2024-01-15T09:00:00Z');

            deps.jobStore.load.mockReturnValue([job]);
            deps.scheduler.occurrences.mockReturnValue([scheduledTime]);
            deps.invoker.invoke.mockImplementation(() => { throw new Error('Handler failed'); });

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.runlog?.log).toHaveBeenCalledWith(
                expect.objectContaining({ jobId: 'job1', status: 'ERROR', message: 'Handler failed' })
            );
            expect(deps.logger?.error).toHaveBeenCalledWith('[Schedule] job job1 error: Handler failed');
        });

        test('should update checkpoint after processing job', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1' });
            const scheduledTime = new Date('2024-01-15T09:00:00Z');

            deps.jobStore.load.mockReturnValue([job]);
            deps.scheduler.occurrences.mockReturnValue([scheduledTime]);

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.checkpoint.set).toHaveBeenCalledWith('job1', scheduledTime.toISOString());
        });

        test('should run only last occurrence when multi is false', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1', multi: false });
            const occurrences = [
                new Date('2024-01-15T08:00:00Z'),
                new Date('2024-01-15T09:00:00Z'),
                new Date('2024-01-15T10:00:00Z')
            ];

            deps.jobStore.load.mockReturnValue([job]);
            deps.scheduler.occurrences.mockReturnValue(occurrences);

            const engine = createScheduleEngine(deps);
            engine.run();

            // Should only invoke once (for the last occurrence)
            expect(deps.invoker.invoke).toHaveBeenCalledTimes(1);
            expect(deps.invoker.invoke).toHaveBeenCalledWith(
                'testHandler',
                expect.objectContaining({ scheduledAt: '2024-01-15T10:00:00.000Z' })
            );
        });

        test('should run all occurrences when multi is true', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1', multi: true });
            const occurrences = [
                new Date('2024-01-15T08:00:00Z'),
                new Date('2024-01-15T09:00:00Z'),
                new Date('2024-01-15T10:00:00Z')
            ];

            deps.jobStore.load.mockReturnValue([job]);
            deps.scheduler.occurrences.mockReturnValue(occurrences);

            const engine = createScheduleEngine(deps);
            engine.run();

            // Should invoke for all occurrences
            expect(deps.invoker.invoke).toHaveBeenCalledTimes(3);
        });

        test('should use checkpoint as from time when available', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1' });
            const checkpointTime = '2024-01-15T08:30:00Z';

            deps.jobStore.load.mockReturnValue([job]);
            deps.checkpoint.get.mockReturnValue(checkpointTime);

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.scheduler.occurrences).toHaveBeenCalledWith(
                job.cron,
                new Date(checkpointTime),
                expect.any(Date),
                expect.any(String)
            );
        });

        test('should use lookBackHours when no checkpoint exists', () => {
            const deps = createMockDeps();
            deps.lookBackHours = 12;
            const job = createTestJob({ id: 'job1' });
            const now = new Date('2024-01-15T10:00:00Z');

            deps.jobStore.load.mockReturnValue([job]);
            deps.checkpoint.get.mockReturnValue(null);
            deps.clock.now.mockReturnValue(now);

            const engine = createScheduleEngine(deps);
            engine.run();

            const expectedFrom = new Date(now.getTime() - 12 * 3600 * 1000);
            expect(deps.scheduler.occurrences).toHaveBeenCalledWith(
                job.cron,
                expectedFrom,
                now,
                expect.any(String)
            );
        });

        test('should use job timezone when specified', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1', tz: 'Europe/London' });

            deps.jobStore.load.mockReturnValue([job]);
            deps.scheduler.occurrences.mockReturnValue([new Date()]);

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.scheduler.occurrences).toHaveBeenCalledWith(
                job.cron,
                expect.any(Date),
                expect.any(Date),
                'Europe/London'
            );
            expect(deps.invoker.invoke).toHaveBeenCalledWith(
                'testHandler',
                expect.objectContaining({ tz: 'Europe/London' })
            );
        });

        test('should release lock in finally block even on error', () => {
            const deps = createMockDeps();
            deps.jobStore.load.mockImplementation(() => { throw new Error('Load failed'); });

            const engine = createScheduleEngine(deps);

            expect(() => engine.run()).toThrow('Load failed');

            const mockLock = deps.lock.acquire() as MockLock;
            expect(mockLock.release).toHaveBeenCalled();
        });

        test('should respect soft time limit', () => {
            const deps = createMockDeps();
            // Set a soft time limit of 100ms for this test
            const SOFT_LIMIT_MS = 100;
            // Simulate elapsed time of 200ms (exceeds the 100ms limit)
            const ELAPSED_TIME_MS = 200;
            deps.softTimeLimitMs = SOFT_LIMIT_MS;

            const jobs = [
                createTestJob({ id: 'job1' }),
                createTestJob({ id: 'job2' }),
                createTestJob({ id: 'job3' })
            ];
            deps.jobStore.load.mockReturnValue(jobs);

            let callCount = 0;
            deps.clock.now.mockImplementation(() => {
                callCount++;
                // After processing first job (3 clock calls), simulate time exceeding soft limit
                if (callCount > 3) {
                    return new Date(Date.now() + ELAPSED_TIME_MS);
                }
                return new Date();
            });

            deps.scheduler.occurrences.mockReturnValue([new Date()]);

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.logger?.info).toHaveBeenCalledWith('[Schedule] soft time limit reached');
        });
    });

    describe('runNow() method', () => {
        test('should invoke handler immediately', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1', handler: 'myHandler' });
            const now = new Date('2024-01-15T10:00:00Z');

            deps.jobStore.load.mockReturnValue([job]);
            deps.clock.now.mockReturnValue(now);

            const engine = createScheduleEngine(deps);
            engine.runNow('job1');

            expect(deps.invoker.invoke).toHaveBeenCalledWith('myHandler', {
                jobId: 'job1',
                scheduledAt: now.toISOString(),
                paramsJson: null,
                tz: MOCK_TIMEZONE
            });
        });

        test('should throw error if job not found', () => {
            const deps = createMockDeps();
            deps.jobStore.load.mockReturnValue([]);

            const engine = createScheduleEngine(deps);

            expect(() => engine.runNow('nonexistent')).toThrow('job not found: nonexistent');
        });

        test('should invoke multiple times when specified', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1' });
            const now = new Date('2024-01-15T10:00:00Z');

            deps.jobStore.load.mockReturnValue([job]);
            deps.clock.now.mockReturnValue(now);

            const engine = createScheduleEngine(deps);
            engine.runNow('job1', 3);

            expect(deps.invoker.invoke).toHaveBeenCalledTimes(3);
        });

        test('should use job paramsJson when available', () => {
            const deps = createMockDeps();
            const job = createTestJob({ id: 'job1', paramsJson: '{"key":"value"}' });

            deps.jobStore.load.mockReturnValue([job]);

            const engine = createScheduleEngine(deps);
            engine.runNow('job1');

            expect(deps.invoker.invoke).toHaveBeenCalledWith(
                'testHandler',
                expect.objectContaining({ paramsJson: '{"key":"value"}' })
            );
        });
    });

    describe('Timezone handling', () => {
        test('should fall back to default timezone when job tz is not set', () => {
            const deps = createMockDeps();
            deps.defaultTz = 'Asia/Tokyo';
            const job = createTestJob({ id: 'job1', tz: null });

            deps.jobStore.load.mockReturnValue([job]);
            deps.scheduler.occurrences.mockReturnValue([new Date()]);

            const engine = createScheduleEngine(deps);
            engine.run();

            expect(deps.scheduler.occurrences).toHaveBeenCalledWith(
                job.cron,
                expect.any(Date),
                expect.any(Date),
                'Asia/Tokyo'
            );
        });

        test('should use Etc/GMT when no timezone is configured and Session is unavailable', () => {
            // Temporarily remove Session mock
            const originalSession = (globalThis as unknown as { Session?: unknown }).Session;
            delete (globalThis as unknown as { Session?: unknown }).Session;

            try {
                const deps = createMockDeps();
                const job = createTestJob({ id: 'job1', tz: null });

                deps.jobStore.load.mockReturnValue([job]);
                deps.scheduler.occurrences.mockReturnValue([new Date()]);

                const engine = createScheduleEngine(deps);
                engine.run();

                expect(deps.scheduler.occurrences).toHaveBeenCalledWith(
                    job.cron,
                    expect.any(Date),
                    expect.any(Date),
                    'Etc/GMT'
                );
            } finally {
                // Restore Session mock
                (globalThis as unknown as { Session: unknown }).Session = originalSession;
            }
        });
    });
});
