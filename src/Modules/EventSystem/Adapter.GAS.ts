namespace EventSystem.Adapters.GAS {
    export class GlobalInvoker implements EventSystem.Ports.Invoker {
        invoke(name: string, ctx: any) {
            const fn = (globalThis as any)[name];
            if (typeof fn !== "function") throw new Error(`Handler not found: ${name}`);
            fn(ctx);
        }
    }
    export class SystemClock implements Shared.Ports.Clock {
        now() { return new Date(); }
    }
    export class GasLogger implements Shared.Ports.Logger {
        info(m: string) { Logger.log(m); }
        error(m: string) { Logger.log(m); }
    }
    export class LogOnlyRunLogger implements EventSystem.Ports.RunLogger {
        log(e: any) { Logger.log(JSON.stringify(e)); }
    }

    export class SpreadsheetJobStore implements EventSystem.Ports.JobStore {
        constructor(private sheetId: string, private sheetName: string) { }

        load(): EventSystem.Ports.Job[] {
            const ss = SpreadsheetApp.openById(this.sheetId);
            const sh = ss.getSheetByName(this.sheetName);
            if (!sh) throw new Error(`Sheet not found: ${this.sheetName}`);
            const values = sh.getDataRange().getValues();
            if (values.length <= 1) return [];
            const header = values[0].map(String);
            const rows = values.slice(1);
            const idx = (name: string) => {
                const i = header.indexOf(name);
                if (i < 0) throw new Error(`Missing column: ${name}`);
                return i;
            };
            const ID = idx("id");
            const HANDLER = idx("handler");
            const PARAMS = header.indexOf("paramsJson");
            const CRON = idx("cron");
            const MULTI = idx("multi");
            const ENABLED = idx("enabled");
            const TZ = header.indexOf("tz");
            const jobs: EventSystem.Ports.Job[] = [];
            for (const r of rows) {
                const id = String(r[ID]).trim();
                if (!id) continue;
                jobs.push({
                    id,
                    handler: String(r[HANDLER]).trim(),
                    paramsJson: PARAMS >= 0 ? (String(r[PARAMS] || "").trim() || null) : null,
                    cron: String(r[CRON]).trim(),
                    multi: String(r[MULTI]).toLowerCase() === "true",
                    enabled: String(r[ENABLED]).toLowerCase() === "true",
                    tz: TZ >= 0 ? (String(r[TZ] || "").trim() || null) : null,
                });
            }
            return jobs;
        }
    }
    export class ScriptPropertiesCheckpoint implements EventSystem.Ports.CheckpointStore {
        constructor(private prefix: string = "event_cp:") { }
        get(jobId: string): string | null {
            const p = PropertiesService.getScriptProperties();
            return p.getProperty(this.prefix + jobId) || null;
        }
        set(jobId: string, iso: string): void {
            const p = PropertiesService.getScriptProperties();
            p.setProperty(this.prefix + jobId, iso);
        }
    }
    export class ScriptLockFactory implements EventSystem.Ports.LockFactory {
        acquire(): EventSystem.Ports.Lock | null {
            const lk = LockService.getScriptLock();
            return {
                tryWait(ms: number): boolean { try { lk.waitLock(ms); return true; } catch { return false; } },
                release(): void { try { lk.releaseLock(); } catch { } }
            };
        }
    }

    export class SpreadsheetDefinitionStore implements Ports.DefinitionStore {
        constructor(private sheetId: string, private wfSheet: string, private stepSheet: string) { }
        loadDefs(): Ports.Definition[] {
            const ss = SpreadsheetApp.openById(this.sheetId);
            const sh = ss.getSheetByName(this.wfSheet);
            if (!sh) throw new Error(`Sheet not found: ${this.wfSheet}`);
            const values = sh.getDataRange().getValues();
            if (values.length <= 1) return [];
            const header = values[0].map(String);
            const rows = values.slice(1);
            const idx = (name: string) => {
                const i = header.indexOf(name);
                if (i < 0) throw new Error(`Missing column: ${name}`);
                return i;
            };
            const ID = idx("id");
            const NAME = header.indexOf("name");
            const ENABLED = idx("enabled");
            const TZ = header.indexOf("defaultTz");
            const out: Ports.Definition[] = [];
            for (const r of rows) {
                const id = String(r[ID]).trim();
                if (!id) continue;
                out.push({
                    id,
                    name: NAME >= 0 ? (String(r[NAME] || "").trim() || null) : null,
                    enabled: String(r[ENABLED]).toLowerCase() === "true",
                    defaultTz: TZ >= 0 ? (String(r[TZ] || "").trim() || null) : null
                });
            }
            return out;
        }
        loadSteps(workflowId: string): Ports.StepDef[] {
            const ss = SpreadsheetApp.openById(this.sheetId);
            const sh = ss.getSheetByName(this.stepSheet);
            if (!sh) throw new Error(`Sheet not found: ${this.stepSheet}`);
            const values = sh.getDataRange().getValues();
            if (values.length <= 1) return [];
            const header = values[0].map(String);
            const rows = values.slice(1);
            const idx = (name: string) => {
                const i = header.indexOf(name);
                if (i < 0) throw new Error(`Missing column: ${name}`);
                return i;
            };
            const WF = idx("workflowId");
            const INDEX = idx("index");
            const HANDLER = idx("handler");
            const PARAMS = header.indexOf("paramsJson");
            const TIMEOUT = header.indexOf("timeoutMs");
            const out: Ports.StepDef[] = [];
            for (const r of rows) {
                if (String(r[WF]).trim() !== workflowId) continue;
                out.push({
                    workflowId,
                    index: Number(r[INDEX]),
                    handler: String(r[HANDLER]).trim(),
                    paramsJson: PARAMS >= 0 ? (String(r[PARAMS] || "").trim() || null) : null,
                    timeoutMs: TIMEOUT >= 0 ? Number(r[TIMEOUT] || 0) || null : null
                });
            }
            return out.sort((a, b) => a.index - b.index);
        }
    }
    export class ScriptPropertiesInstanceStore implements Ports.InstanceStore {
        constructor(private prefix: string = "wf:inst:") { }
        create(i: Ports.Instance): void {
            const p = PropertiesService.getScriptProperties();
            if (p.getProperty(this.prefix + i.instanceId)) throw new Error("instance exists: " + i.instanceId);
            p.setProperty(this.prefix + i.instanceId, JSON.stringify(i));
        }
        get(instanceId: string): Ports.Instance | null {
            const s = PropertiesService.getScriptProperties().getProperty(this.prefix + instanceId);
            return s ? JSON.parse(s) : null;
        }
        set(i: Ports.Instance): void {
            PropertiesService.getScriptProperties().setProperty(this.prefix + i.instanceId, JSON.stringify(i));
        }
    }
    export class OneTimeTriggerEnqueuer implements Ports.Enqueuer {
        constructor(private resumeFnName: string = "workflow_resume") { }
        enqueueResume(instanceId: string, delayMs: number = 0): void {
            const when = new Date(Date.now() + Math.max(0, delayMs));
            const key = `wf:resumeArg:${instanceId}`;
            PropertiesService.getScriptProperties().setProperty(key, instanceId);
            ScriptApp.newTrigger(this.resumeFnName).timeBased().at(when).create();
        }
    }
}
