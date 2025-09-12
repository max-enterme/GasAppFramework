/// <reference path="../../_framework/Assert.ts" />
/// <reference path="../../_framework/Test.ts" />
/// <reference path="../../_framework/Runner.ts" />
/// <reference path="../../_framework/GasReporter.ts" />
/// <reference path="../../../src/Modules/EventSystem/Core.Types.d.ts" />
/// <reference path="../../../src/Modules/EventSystem/Workflow.Engine.ts" />

namespace Spec_Workflow_Extended {
    // --- Test doubles ---
    class Defs implements Workflow.Ports.DefinitionStore {
        private defs: Workflow.Ports.Definition[] = [
            { id: 'wf', enabled: true, name: null, defaultTz: 'Asia/Tokyo' }
        ]
        private steps: Workflow.Ports.StepDef[] = [
            { workflowId: 'wf', index: 0, handler: 'h1', paramsJson: JSON.stringify({ a: 1 }), timeoutMs: null },
            { workflowId: 'wf', index: 1, handler: 'h2', paramsJson: null, timeoutMs: null },
            { workflowId: 'wf', index: 2, handler: 'h3', paramsJson: null, timeoutMs: null }
        ]
        loadDefs(): Workflow.Ports.Definition[] { return this.defs.slice() }
        loadSteps(id: string): Workflow.Ports.StepDef[] { return this.steps.filter(s => s.workflowId === id).slice() }
        setSteps(steps: Workflow.Ports.StepDef[]) { this.steps = steps.slice() }
    }

    class Inst implements Workflow.Ports.InstanceStore {
        private m = new Map<string, Workflow.Ports.Instance>()
        create(i: Workflow.Ports.Instance) {
            if (this.m.has(i.instanceId)) throw new Error('exists')
            this.m.set(i.instanceId, i)
        }
        get(id: string) { return this.m.get(id) ?? null }
        set(i: Workflow.Ports.Instance) { this.m.set(i.instanceId, i) }
    }

    class Clock implements Workflow.Ports.Clock {
        private nowMs: number
        constructor(iso: string) { this.nowMs = new Date(iso).getTime() }
        now(): Date { return new Date(this.nowMs) }
        advance(ms: number) { this.nowMs += ms }
    }

    class Inv implements Workflow.Ports.Invoker {
        calls: any[] = []
        behavior: { [name: string]: 'ok' | 'throw' } = {}
        private advanceBy: { [name: string]: number }
        constructor(private clock: Clock, advanceBy?: { [name: string]: number }) {
            this.advanceBy = advanceBy ?? {}
        }
        invoke(name: string, ctx: any) {
            this.calls.push({ name, ctx })
            if (this.behavior[name] === 'throw') {
                throw new Error('boom-by-handler')
            }
            const adv = this.advanceBy[name] ?? 0
            if (adv > 0) this.clock.advance(adv)
        }
    }

    class Enq implements Workflow.Ports.Enqueuer {
        calls: { id: string; ms: number }[] = []
        enqueueResume(id: string, ms: number = 0) {
            this.calls.push({ id, ms })
        }
    }

    function newEngine(opts?: { softTimeLimitMs?: number; advanceBy?: { [name: string]: number } }) {
        const defs = new Defs()
        const inst = new Inst()
        const clock = new Clock('2025-09-12T00:00:00Z')
        const inv = new Inv(clock, opts?.advanceBy)
        const enq = new Enq()
        const WF = EventSystem.Workflow.create({
            defs, inst, invoker: inv, enq, clock,
            softTimeLimitMs: opts?.softTimeLimitMs
        })
        return { WF, defs, inst, inv, enq, clock }
    }

    // --- Tests ---

    T.it('runs steps sequentially in order (h1 -> h2 -> h3)', () => {
        const { WF, inv } = newEngine()
        const id = WF.start('wf', JSON.stringify({ x: 1 }), 'Asia/Tokyo')
        WF.resume(id)
        TAssert.equals(inv.calls.map(c => c.name), ['h1', 'h2', 'h3'], 'handlers should be called in order')
        TAssert.isTrue(inv.calls[0].ctx.paramsJson !== null, 'h1 receives paramsJson')
        TAssert.isTrue(inv.calls[0].ctx.workflowId === 'wf', 'ctx.workflowId is wf')
    })

    T.it('sets instance to done after last step', () => {
        const { WF, inst } = newEngine()
        const id = WF.start('wf')
        WF.resume(id)
        const stored = inst.get(id)!
        TAssert.isTrue(stored.done === true, 'instance should be done')
        TAssert.equals(stored.cursor, 3, 'cursor should be at steps length')
    })

    T.it('enqueues resume when a step throws (retry path)', () => {
        const { WF, inv, enq, inst } = newEngine()
        inv.behavior['h2'] = 'throw'
        const id = WF.start('wf')
        WF.resume(id)
        // h1 -> OK, h2 -> throw, enqueue
        TAssert.equals(inv.calls.map(c => c.name), ['h1', 'h2'], 'should stop at throwing step')
        TAssert.isTrue(enq.calls.length >= 1, 'enqueue should be called on error')
        const s = inst.get(id)!
        TAssert.isTrue(s.done === false, 'instance should not be done after error')
        TAssert.equals(s.cursor, 1, 'cursor should remain at failing step index')
    })

    T.it('respects softTimeLimitMs (engine budget): stops mid-way and enqueues', () => {
        // 1ƒXƒeƒbƒvŽÀs‚²‚Æ‚É 2ms i‚Þ‚æ‚¤‚É‚µ‚ÄA—\ŽZ 2ms ‚Å’†’f‚ð—U”­
        const { WF, inv, enq } = newEngine({ softTimeLimitMs: 2, advanceBy: { h1: 2, h2: 2, h3: 2 } })
        const id = WF.start('wf')
        WF.resume(id)
        TAssert.isTrue(inv.calls.length >= 1, 'at least first step should run')
        TAssert.isTrue(inv.calls.length < 3, 'should not complete all steps within tight budget')
        TAssert.isTrue(enq.calls.length >= 1, 'should enqueue to continue')
    })

    T.it('respects per-step timeoutMs: breaks after step hits its timeout and enqueues', () => {
        const { WF, defs, inv, enq } = newEngine({ softTimeLimitMs: 60000, advanceBy: { h2: 5 } })
        defs.setSteps([
            { workflowId: 'wf', index: 0, handler: 'h1', paramsJson: null, timeoutMs: null },
            { workflowId: 'wf', index: 1, handler: 'h2', paramsJson: null, timeoutMs: 1 }, // h2 ‚Ì‹–—e 1ms
            { workflowId: 'wf', index: 2, handler: 'h3', paramsJson: null, timeoutMs: null }
        ])
        const id = WF.start('wf')
        WF.resume(id)
        TAssert.equals(inv.calls.map(c => c.name).slice(0, 2), ['h1', 'h2'], 'h1 then h2 should run')
        TAssert.isTrue(inv.calls.length < 3, 'timeout should stop before h3')
        TAssert.isTrue(enq.calls.length >= 1, 'should enqueue to continue after timeout break')
    })
}
