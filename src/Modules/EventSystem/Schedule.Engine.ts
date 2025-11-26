namespace EventSystem.Schedule {
    // ─────────────────────────────────────────────────────────────────────────
    // Simple helper functions (preserved for backward compatibility)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generate a list of minute-boundary timestamps between `from` and `to`.
     * This is a simple helper that does not use cron expressions.
     */
    export function occurrences(from: Date, to: Date): Date[] {
        const out: Date[] = [];
        let cur = new Date(from.getTime());
        cur.setSeconds(0, 0);
        while (cur.getTime() < to.getTime()) {
            cur = new Date(cur.getTime() + 60000);
            if (cur.getTime() <= to.getTime()) out.push(cur);
        }
        return out;
    }

    /**
     * Simple check if a time is at a minute boundary (seconds === 0).
     * 
     * NOTE: This is a basic placeholder that does NOT evaluate actual cron expressions.
     * For proper cron evaluation, use `Ports.Scheduler.isDue()` instead.
     * This function is preserved for backward compatibility only.
     */
    export function isDue(cronExpr: string, at: Date): boolean {
        void cronExpr; // unused in this simple implementation
        return at.getSeconds() === 0;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Schedule Engine Implementation
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Dependency configuration for creating a Schedule Engine.
     * Follows the same pattern as TriggerDeps and WorkflowDeps.
     */
    export type ScheduleDeps = {
        /** Store for loading job definitions */
        jobStore: Ports.JobStore;
        /** Store for reading/writing job checkpoints (last run time) */
        checkpoint: Ports.CheckpointStore;
        /** Handler function invoker */
        invoker: Ports.Invoker;
        /** Lock factory for concurrency control */
        lock: Ports.LockFactory;
        /** Clock for getting current time */
        clock: Ports.Clock;
        /** Scheduler for cron expression evaluation */
        scheduler: Ports.Scheduler;
        /** Optional logger for info/error messages */
        logger?: Ports.Logger;
        /** Optional run logger for detailed execution logs */
        runlog?: Ports.RunLogger;
        /** How many hours back to look for missed executions (default: 24) */
        lookBackHours?: number;
        /** Soft time limit in ms before stopping job processing (default: 240000) */
        softTimeLimitMs?: number;
        /** Default timezone when job-level tz is not defined */
        defaultTz?: string;
    };

    /**
     * Resolve timezone string, falling back to Session timezone or 'Etc/GMT'.
     */
    function ensureTzString(tz?: string | null): string {
        if (typeof tz === 'string' && tz.trim()) return tz;
        try {
            if (typeof Session !== 'undefined' && Session.getScriptTimeZone) {
                return Session.getScriptTimeZone();
            }
        } catch { /* ignore */ }
        return 'Etc/GMT';
    }

    /**
     * Create a Schedule Engine instance.
     * 
     * @param deps - Dependencies for the engine
     * @returns A ScheduleEngine with `run()` and `runNow()` methods
     * 
     * @example
     * ```typescript
     * const scheduler = EventSystem.Schedule.create({
     *     jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(sheetId, 'jobs'),
     *     checkpoint: new EventSystem.Adapters.GAS.ScriptPropertiesCheckpoint(),
     *     lock: new EventSystem.Adapters.GAS.ScriptLockFactory(),
     *     invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
     *     scheduler: mySchedulerAdapter, // implements Ports.Scheduler
     *     clock: new EventSystem.Adapters.GAS.SystemClock(),
     *     logger: new EventSystem.Adapters.GAS.GasLogger()
     * });
     * 
     * scheduler.run();
     * ```
     */
    export function create(deps: ScheduleDeps): ScheduleEngine {
        const logger = deps.logger ?? { info: (_: string) => { /* no-op */ }, error: (_: string) => { /* no-op */ } };
        const runlog = deps.runlog ?? { log: (_: unknown) => { /* no-op */ } };
        const lookBackMs = Math.max(0, (deps.lookBackHours ?? 24) * 3600 * 1000);
        const softLimit = Math.max(0, deps.softTimeLimitMs ?? 240000);

        /**
         * Run all due scheduled jobs.
         * - Acquires a lock to prevent concurrent executions
         * - Loads enabled jobs from the job store
         * - Determines due occurrences based on cron expressions
         * - Invokes handlers for due jobs
         * - Updates checkpoints after processing
         */
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
                    // Check soft time limit before processing each job
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

                    // Determine which occurrences to run: all if multi, otherwise only the last
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

                        // Check soft time limit after each invocation
                        if (softLimit > 0 && (deps.clock.now().getTime() - t0) >= softLimit) {
                            logger.info('[Schedule] soft time limit reached');
                            break;
                        }
                    }

                    // Update checkpoint with the latest occurrence time
                    const latest = toRun[toRun.length - 1];
                    deps.checkpoint.set(job.id, latest.toISOString());
                }
            } finally {
                try { lk.release(); } catch { /* ignore */ }
            }
        }

        /**
         * Immediately run a specific job by ID.
         * 
         * @param jobId - The job ID to run
         * @param times - Number of times to run (default: 1)
         * @throws Error if job not found
         * 
         * Note: When times > 1, each invocation gets a scheduledAt timestamp
         * offset by 1 second to ensure unique run identifiers. This follows
         * the same pattern as TriggerEngine.runNow().
         */
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
}
