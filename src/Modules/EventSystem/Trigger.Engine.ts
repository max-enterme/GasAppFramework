namespace EventSystem.Trigger {
    export type TriggerDeps = {
        jobStore: Ports.JobStore;
        checkpoint: Ports.CheckpointStore;
        invoker: Ports.Invoker;
        lock: Ports.LockFactory;
        clock: Ports.Clock;
        scheduler: Ports.Scheduler;
        logger?: Ports.Logger;
        runlog?: Ports.RunLogger;
        lookBackHours?: number;
        softTimeLimitMs?: number;
        defaultTz?: string;
    };

    function ensureTzString(tz?: string | null): string {
        if (typeof tz === "string" && tz.trim()) return tz;
        try {
            if (typeof Session !== "undefined" && Session.getScriptTimeZone) {
                return Session.getScriptTimeZone();
            }
        } catch { }
        return "Etc/GMT";
    }

    export function create(deps: TriggerDeps): TriggerEngine {
        const logger = deps.logger ?? { info: (_: string) => { }, error: (_: string) => { } };
        const runlog = deps.runlog ?? { log: (_: any) => { } };
        const lookBackMs = Math.max(0, (deps.lookBackHours ?? 24) * 3600 * 1000);
        const softLimit = Math.max(0, deps.softTimeLimitMs ?? 240000);

        function tick(): void {
            const lk = deps.lock.acquire();
            if (!lk || !lk.tryWait(50)) { logger.info("[Trigger] skip: lock busy"); return; }
            const t0 = deps.clock.now().getTime();
            try {
                const now = deps.clock.now();
                const jobs = deps.jobStore.load().filter(j => j.enabled);

                for (const job of jobs) {
                    const tzStr = ensureTzString(job.tz ?? deps.defaultTz);
                    const cpIso = deps.checkpoint.get(job.id);
                    const from = cpIso ? new Date(cpIso) : new Date(now.getTime() - lookBackMs);
                    const occ = deps.scheduler.occurrences(job.cron, from, now, tzStr);
                    if (occ.length === 0) {
                        runlog.log({ jobId: job.id, runId: "-", scheduledIso: from.toISOString(), status: 'SKIP', message: 'no due' });
                        continue;
                    }

                    const toRun = job.multi ? occ : [occ[occ.length - 1]];
                    for (const d of toRun) {
                        const runId = `${job.id}-${d.getTime()}`;
                        try {
                            runlog.log({ jobId: job.id, runId, scheduledIso: d.toISOString(), status: 'START' });
                            deps.invoker.invoke(job.handler, { jobId: job.id, scheduledAt: d.toISOString(), paramsJson: job.paramsJson ?? null, tz: tzStr });
                            runlog.log({ jobId: job.id, runId, scheduledIso: d.toISOString(), status: 'SUCCESS' });
                        } catch (e: any) {
                            runlog.log({ jobId: job.id, runId, scheduledIso: d.toISOString(), status: 'ERROR', message: String(e && e.message || e) });
                            logger.error(`[Trigger] job ${job.id} error: ` + String(e && e.message || e));
                        }
                        if (softLimit > 0 && (deps.clock.now().getTime() - t0) >= softLimit) {
                            logger.info("[Trigger] soft time limit reached");
                            break;
                        }
                    }

                    const latest = toRun[toRun.length - 1];
                    deps.checkpoint.set(job.id, latest.toISOString());
                }
            } finally {
                try { lk.release(); } catch { }
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
                deps.invoker.invoke(job.handler, { jobId: job.id, scheduledAt: d.toISOString(), paramsJson: job.paramsJson ?? null, tz: tzStr });
            }
        }

        return { tick, runNow };
    }
}
