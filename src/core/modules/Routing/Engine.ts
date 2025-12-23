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
        if (!path.startsWith('/')) path = '/' + path;
        const tokens = path.split('/').filter(x => x.length > 0);
        const segs: Segment[] = [];
        for (const t of tokens) {
            if (t === '*') segs.push({ kind: 'wildcard' });
            else if (t.startsWith(':')) segs.push({ kind: 'param', name: t.slice(1) });
            else segs.push({ kind: 'static', value: t });
        }
        return segs;
    }

    function matchSegments(segs: Segment[], parts: string[]): { ok: true; params: any } | { ok: false } {
        const params: any = {};
        let segmentIndex = 0;

        for (; segmentIndex < segs.length; segmentIndex++) {
            const segment = segs[segmentIndex];
            const part = parts[segmentIndex];

            // Wildcard can match zero or more parts
            if (segment.kind === 'wildcard') {
                params['*'] = decodeURIComponent(parts.slice(segmentIndex).join('/'));
                return { ok: true, params };
            }

            // All other segments require a matching part
            if (!part) return { ok: false };

            if (segment.kind === 'static') {
                if (part !== segment.value) return { ok: false };
            } else if (segment.kind === 'param') {
                params[segment.name] = decodeURIComponent(part);
            }
        }

        // All segments matched; ensure no extra parts remain
        if (segmentIndex !== parts.length) return { ok: false };

        return { ok: true, params };
    }

    /**
     * Calculate route specificity for prioritization
     * Higher score = more specific route (should be matched first)
     */
    function calculateSpecificity(segments: Segment[]): number {
        let score = 0;
        for (const seg of segments) {
            if (seg.kind === 'static') score += 3;
            else if (seg.kind === 'param') score += 2;
            else score += 1; // wildcard
        }
        return score;
    }

    /**
     * Compose middleware chain with handler
     */
    function composeMiddleware<Ctx, Res>(
        middlewares: Ports.Middleware<Ctx, Res>[],
        handler: Ports.Handler<Ctx, Res>
    ): Ports.Handler<Ctx, Res> {
        return middlewares.reduceRight<Ports.Handler<Ctx, Res>>(
            (next, mw) => (ctx: Ctx) => mw(ctx, () => next(ctx)),
            handler
        );
    }

    export function create<Ctx = any, Res = any>(logger?: Ports.Logger): Router<Ctx, Res> {
        const middlewares: Ports.Middleware<Ctx, Res>[] = [];
        const routes: Route<Ctx, Res>[] = [];
        const log = logger ?? { info: (_: string) => { }, error: (_: string) => { } };

        function use(mw: Ports.Middleware<Ctx, Res>): Router<Ctx, Res> {
            middlewares.push(mw);
            return api;
        }

        function register(path: string, handler: Ports.Handler<Ctx, Res>): Router<Ctx, Res> {
            const segments = parsePath(path);
            routes.push({ path, segments, handler });
            // Sort by specificity (most specific first)
            routes.sort((a, b) => calculateSpecificity(b.segments) - calculateSpecificity(a.segments));
            log.info(`[Router] registered route: ${path}`);
            return api;
        }

        function registerAll(map: { [path: string]: Ports.Handler<Ctx, Res> }): Router<Ctx, Res> {
            for (const [path, handler] of Object.entries(map)) {
                register(path, handler);
            }
            return api;
        }

        function mount(prefix: string, sub: Router<Ctx, Res>): Router<Ctx, Res> {
            // Resolve sub routes by wrapping dispatch
            return register(prefix + '/*', (ctx: any) => (sub as any).dispatch('/' + ctx.params['*'], ctx));
        }

        function resolve(path: string): { handler: Ports.Handler<Ctx, Res>, params: any } | null {
            const parts = path.split('/').filter(x => x.length > 0);

            for (const route of routes) {
                const match = matchSegments(route.segments, parts);

                if (match.ok) {
                    const params = match.params || {};
                    // Return the original handler, not the wrapped one, so tests can compare handlers
                    return { handler: route.handler, params };
                }
            }

            return null;
        }

        function dispatch(path: string, ctx: Ctx): Res {
            const resolved = resolve(path);
            if (!resolved) throw new Error(`No route found for path: ${path}`);

            // Compose middlewares with the resolved handler
            const composedHandler = composeMiddleware(middlewares, resolved.handler);
            // Merge params into context
            const contextWithParams = { ...ctx, params: { ...(ctx as any).params, ...resolved.params } };

            log.info(`[Router] dispatching to route: ${path}`);
            return composedHandler(contextWithParams);
        }

        const api: Router<Ctx, Res> = { use, register, registerAll, mount, resolve, dispatch };
        return api;
    }
}
