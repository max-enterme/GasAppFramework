declare namespace EventSystem {
    namespace Ports {
        interface Clock { now(): Date; }
        interface Logger { info(msg: string): void; error(msg: string): void; }
        interface RunLogger { log(entry: any): void; }
        interface Invoker { invoke(handlerName: string, ctx: any): void; }

        interface Job {
            id: string;
            handler: string;
            paramsJson?: string | null;
            cron: string;
            multi: boolean;
            enabled: boolean;
            tz?: string | null;
        }
        interface JobStore { load(): Job[]; }
        interface CheckpointStore { get(jobId: string): string | null; set(jobId: string, iso: string): void; }
        interface Lock { tryWait(ms: number): boolean; release(): void; }
        interface LockFactory { acquire(): Lock | null; }
        interface Scheduler {
            occurrences(cronExpr: string, from: Date, to: Date, tz?: string | null): Date[];
            isDue(cronExpr: string, at: Date, tz?: string | null): boolean;
        }

        interface Definition {
            id: string;
            name?: string | null;
            enabled: boolean;
            defaultTz?: string | null;
        }
        interface StepDef {
            workflowId: string;
            index: number;
            handler: string;
            paramsJson?: string | null;
            timeoutMs?: number | null;
        }
        interface DefinitionStore {
            loadDefs(): Definition[];
            loadSteps(workflowId: string): StepDef[];
        }
        interface Instance {
            instanceId: string;
            workflowId: string;
            createdIso: string;
            tz?: string | null;
            payloadJson?: string | null;
            cursor: number;
            done: boolean;
            lastError?: string | null;
            updatedIso: string;
        }
        interface InstanceStore {
            create(i: Instance): void;
            get(id: string): Instance | null;
            set(i: Instance): void;
        }
        interface Enqueuer { enqueueResume(instanceId: string, delayMs?: number): void; }
    }

    interface TriggerEngine {
        tick(): void;
        runNow(jobId: string, times?: number): void;
    }

    interface WorkflowEngine {
        start(workflowId: string, payloadJson?: string | null, tz?: string | null): string;
        resume(instanceId: string): void;
    }
}
