/// <reference path="../../_framework/Assert.ts" />
/// <reference path="../../_framework/Test.ts" />
/// <reference path="../../_framework/Runner.ts" />
/// <reference path="../../_framework/GasReporter.ts" />
/// <reference path="../../../src/Modules/EventSystem/Core.Types.d.ts" />
/// <reference path="../../../src/Modules/EventSystem/Trigger.Engine.ts" />
/// <reference path="../../../src/Modules/EventSystem/Schedule.Engine.ts" />

namespace Spec_Trigger {
    class FakeJobStore implements EventSystem.Ports.JobStore {
        constructor(private jobs: EventSystem.Ports.Job[]) { }
        load() { return this.jobs.slice(); }
    }
    class FakeCP implements EventSystem.Ports.CheckpointStore {
        private m = new Map<string, string>();
        get(id: string) { return this.m.get(id) ?? null; }
        set(id: string, v: string) { this.m.set(id, v); }
    }
    class FakeInvoker implements EventSystem.Ports.Invoker {
        calls: any[] = []; invoke(name: string, ctx: any) { this.calls.push({ name, ctx }); }
    }
    class FakeLock implements EventSystem.Ports.Lock { private held = false; tryWait() { if (this.held) return false; this.held = true; return true; } release() { this.held = false; } }
    class FakeLockFactory implements EventSystem.Ports.LockFactory { private lk = new FakeLock(); acquire() { return this.lk; } }
    class FakeClock implements EventSystem.Ports.Clock { constructor(private d: Date) { } now() { return new Date(this.d.getTime()); } }

    T.it("multi=false runs only last due occurrence", () => {
        const now = new Date("2025-09-12T00:05:00Z");
        const inv = new FakeInvoker();
        const es = EventSystem.Trigger.create({
            jobStore: new FakeJobStore([{ id: "j1", handler: "handle_j1", paramsJson: null, cron: "*/1 * * * *", multi: false, enabled: true, tz: "Asia/Tokyo" }]),
            checkpoint: new FakeCP(),
            invoker: inv,
            lock: new FakeLockFactory(),
            clock: new FakeClock(now),
            scheduler: EventSystem.Schedule,
        });
        es.tick();
        TAssert.isTrue(inv.calls.length === 1, "should run last only");
    });
}
