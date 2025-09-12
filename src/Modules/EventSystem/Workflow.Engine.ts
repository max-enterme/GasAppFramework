namespace EventSystem.Workflow {
    export type WorkflowDeps = {
        defs: Ports.DefinitionStore
        inst: Ports.InstanceStore
        invoker: Ports.Invoker
        enq: Ports.Enqueuer
        clock: Ports.Clock
        logger?: Ports.Logger
        runlog?: Ports.RunLogger
        softTimeLimitMs?: number
    }

    function ensureTzString(tz?: string | null): string {
        if (typeof tz === 'string' && tz.trim()) return tz
        try {
            // GAS only
            // @ts-ignore
            if (typeof Session !== 'undefined' && Session.getScriptTimeZone) {
                // @ts-ignore
                return Session.getScriptTimeZone()
            }
        } catch { }
        return 'Etc/GMT'
    }

    export function create(deps: WorkflowDeps) {
        const logger = deps.logger ?? { info: (_: string) => { }, error: (_: string) => { } }
        const runlog = deps.runlog ?? { log: (_: any) => { } }
        const softLimit = Math.max(0, deps.softTimeLimitMs ?? 60000)

        function start(workflowId: string, payloadJson?: string | null, tz?: string | null): string {
            const id = `${workflowId}-${deps.clock.now().getTime()}-${Math.floor(Math.random() * 1e6)}`
            const inst: Ports.Instance = {
                instanceId: id,
                workflowId,
                createdIso: deps.clock.now().toISOString(),
                tz: tz ?? null,
                payloadJson: payloadJson ?? null,
                cursor: 0,
                done: false,
                updatedIso: deps.clock.now().toISOString(),
                lastError: null
            }
            deps.inst.create(inst)
            deps.enq.enqueueResume(id, 0)
            runlog.log({ workflowId, instanceId: id, stepIndex: -1, status: 'ENQ', message: 'start enqueued' })
            return id
        }

        function resume(instanceId: string): void {
            const t0 = deps.clock.now().getTime()
            const inst = deps.inst.get(instanceId)
            if (!inst) throw new Error(`instance not found: ${instanceId}`)
            if (inst.done) {
                logger.info(`[Workflow] instance already done: ${instanceId}`)
                return
            }

            const defs = deps.defs.loadDefs()
            const wf = defs.find(d => d.id === inst.workflowId && d.enabled)
            if (!wf) throw new Error(`workflow not found or disabled: ${inst.workflowId}`)

            const steps = deps.defs.loadSteps(inst.workflowId).sort((a, b) => a.index - b.index)
            if (inst.cursor >= steps.length) {
                inst.done = true
                inst.updatedIso = deps.clock.now().toISOString()
                deps.inst.set(inst)
                runlog.log({ workflowId: inst.workflowId, instanceId: inst.instanceId, stepIndex: steps.length, status: 'DONE' })
                return
            }

            const tzStr = ensureTzString(inst.tz ?? wf.defaultTz)
            const budget = softLimit
            let ranAny = false

            while (inst.cursor < steps.length) {
                const step = steps[inst.cursor]
                const s0 = deps.clock.now().getTime()
                try {
                    runlog.log({ workflowId: inst.workflowId, instanceId: inst.instanceId, stepIndex: inst.cursor, status: 'START' })
                    deps.invoker.invoke(step.handler, {
                        workflowId: inst.workflowId,
                        instanceId: inst.instanceId,
                        stepIndex: inst.cursor,
                        payloadJson: inst.payloadJson ?? null,
                        tz: tzStr,
                        paramsJson: step.paramsJson ?? null
                    })
                    const elapsed = deps.clock.now().getTime() - s0
                    runlog.log({
                        workflowId: inst.workflowId,
                        instanceId: inst.instanceId,
                        stepIndex: inst.cursor,
                        status: 'SUCCESS',
                        elapsedMs: elapsed
                    })
                    inst.cursor += 1
                    inst.lastError = null
                    inst.updatedIso = deps.clock.now().toISOString()
                    deps.inst.set(inst)
                    ranAny = true
                } catch (e: any) {
                    const elapsed = deps.clock.now().getTime() - s0
                    const msg = String(e && e.message || e)
                    runlog.log({
                        workflowId: inst.workflowId,
                        instanceId: inst.instanceId,
                        stepIndex: inst.cursor,
                        status: 'ERROR',
                        elapsedMs: elapsed,
                        message: msg
                    })
                    inst.lastError = msg
                    inst.updatedIso = deps.clock.now().toISOString()
                    deps.inst.set(inst)
                    deps.enq.enqueueResume(inst.instanceId, 5000)
                    runlog.log({
                        workflowId: inst.workflowId,
                        instanceId: inst.instanceId,
                        stepIndex: inst.cursor,
                        status: 'ENQ',
                        message: 'retry after error'
                    })
                    return
                }

                const elapsedAll = deps.clock.now().getTime() - t0
                const stepTimeout = step.timeoutMs ?? 0
                const overStepBudget = stepTimeout > 0 && (deps.clock.now().getTime() - s0) >= stepTimeout
                const overEngineBudget = budget > 0 && elapsedAll >= budget
                if (overStepBudget || overEngineBudget) break
            }

            if (inst.cursor >= steps.length) {
                inst.done = true
                inst.updatedIso = deps.clock.now().toISOString()
                deps.inst.set(inst)
                runlog.log({ workflowId: inst.workflowId, instanceId: inst.instanceId, stepIndex: steps.length, status: 'DONE' })
                return
            }

            deps.enq.enqueueResume(inst.instanceId, ranAny ? 0 : 5000)
            runlog.log({
                workflowId: inst.workflowId,
                instanceId: inst.instanceId,
                stepIndex: inst.cursor,
                status: 'ENQ',
                message: 'continue'
            })
        }

        return { start, resume }
    }
}
