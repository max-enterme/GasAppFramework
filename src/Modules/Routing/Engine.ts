namespace Routing {
    type Segment =
        | { kind: 'static'; value: string }
        | { kind: 'param'; name: string }
        | { kind: 'wildcard' }

    type Route<Ctx, Res> = {
        path: string
        segments: Segment[]
        handler: Ports.Handler<Ctx, Res>
    }

    function parsePath(path: string): Segment[] {
        if (!path.startsWith('/')) path = '/' + path
        const tokens = path.split('/').filter(x => x.length > 0)
        const segs: Segment[] = []
        for (const t of tokens) {
            if (t === '*') segs.push({ kind: 'wildcard' })
            else if (t.startsWith(':')) segs.push({ kind: 'param', name: t.slice(1) })
            else segs.push({ kind: 'static', value: t })
        }
        return segs
    }

    function matchSegments(segs: Segment[], parts: string[]): { ok: true; params: any } | { ok: false } {
        const params: any = {}
        let i = 0
        for (; i < segs.length; i++) {
            const s = segs[i]
            const part = parts[i]
            if (!part && s.kind !== 'wildcard') return { ok: false }
            if (s.kind === 'static') { if (part !== s.value) return { ok: false } }
            else if (s.kind === 'param') { params[s.name] = decodeURIComponent(part) }
            else if (s.kind === 'wildcard') { params['*'] = decodeURIComponent(parts.slice(i).join('/')); return { ok: true, params } }
        }
        if (i !== parts.length) return { ok: false }
        return { ok: true, params }
    }

    export function create<Ctx = any, Res = any>(logger?: Ports.Logger): Router<Ctx, Res> {
        function specificity(segments: any[]): number {
            let score = 0
            for (const s of segments) {
                if (s.kind === 'static') score += 3
                else if (s.kind === 'param') score += 2
                else score += 1
            }
            return score
        }
        const mws: Ports.Middleware<Ctx, Res>[] = []
        const routes: Route<Ctx, Res>[] = []
        const log = logger ?? { info: (_: string) => { }, error: (_: string) => { } }

        function use(mw: Ports.Middleware<Ctx, Res>): Router<Ctx, Res> {
            mws.push(mw); return api
        }
        function register(path: string, handler: Ports.Handler<Ctx, Res>): Router<Ctx, Res> {
            routes.push({ path, segments: parsePath(path), handler }); routes.sort((a, b) => specificity(b.segments) - specificity(a.segments)); return api
        }
        function registerAll(map: { [path: string]: Ports.Handler<Ctx, Res> }): Router<Ctx, Res> {
            for (const k of Object.keys(map)) register(k, map[k]); return api
        }
        function mount(prefix: string, sub: Router<Ctx, Res>): Router<Ctx, Res> {
            // resolve sub routes by wrapping dispatch
            return register(prefix + '/*', (ctx: any) => (sub as any).dispatch('/' + ctx.params['*'], ctx))
        }
        function resolve(path: string): { handler: Ports.Handler<Ctx, Res>, params: any } | null {
            const parts = path.split('/').filter(x => x.length > 0)
            for (const r of routes) {
                const m = matchSegments(r.segments, parts)
                if ((m as any).ok) {
                    const params = (m as any).params || {}
                    const baseHandler = r.handler
                    const composed = mws.reduceRight((next, mw) => (c: Ctx) => mw(next, c), baseHandler)
                    const handler: Ports.Handler<Ctx, Res> = (c: any) => composed({ ...(c as any), params })
                    return { handler, params }
                }
            }
            return null
        }
        function dispatch(path: string, ctx: Ctx): Res {
            const hit = resolve(path)
            if (!hit) throw new Error(`Route not found: ${path}`)
            log.info(`[Router] ${path}`)
            return hit.handler(ctx)
        }
        const api: Router<Ctx, Res> = { use, register, registerAll, mount, resolve, dispatch }
        return api
    }
}
