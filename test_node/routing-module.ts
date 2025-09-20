/**
 * Routing module wrapper for Node.js testing
 * This module provides a testable implementation of the Routing namespace
 */

// Define types for routing
export interface RouteContext {
    params: Record<string, string>
    query?: Record<string, string>
    headers?: Record<string, string>
    [key: string]: any
}

export type RouteHandler<Ctx = RouteContext, Res = any> = (ctx: Ctx) => Res
export type Middleware<Ctx = RouteContext, Res = any> = (ctx: Ctx, next: () => Res) => Res

type Segment =
    | { kind: 'static'; value: string }
    | { kind: 'param'; name: string }
    | { kind: 'wildcard' }

type Route<Ctx, Res> = {
    path: string
    segments: Segment[]
    handler: RouteHandler<Ctx, Res>
}

/**
 * Parse a route path into segments
 */
function parsePath(path: string): Segment[] {
    if (!path.startsWith('/')) path = '/' + path;
    const tokens = path.split('/').filter(x => x.length > 0);
    const segs: Segment[] = [];
    
    for (const t of tokens) {
        if (t === '*') {
            segs.push({ kind: 'wildcard' });
        } else if (t.startsWith(':')) {
            segs.push({ kind: 'param', name: t.slice(1) });
        } else if (t.includes(':')) {
            // Handle patterns like "v:version" - treat as parameter
            const colonIndex = t.indexOf(':');
            const paramName = t.slice(colonIndex + 1);
            segs.push({ kind: 'param', name: paramName });
        } else {
            segs.push({ kind: 'static', value: t });
        }
    }
    return segs;
}

/**
 * Match route segments against URL parts
 */
function matchSegments(segs: Segment[], parts: string[]): { ok: true; params: Record<string, string> } | { ok: false } {
    const params: Record<string, string> = {};
    let i = 0;
    
    for (; i < segs.length; i++) {
        const s = segs[i];
        const part = parts[i];
        
        if (!part && s.kind !== 'wildcard') return { ok: false };
        
        if (s.kind === 'static') {
            if (part !== s.value) return { ok: false };
        } else if (s.kind === 'param') {
            params[s.name] = decodeURIComponent(part);
        } else if (s.kind === 'wildcard') {
            params['*'] = decodeURIComponent(parts.slice(i).join('/'));
            return { ok: true, params };
        }
    }
    
    if (i !== parts.length) return { ok: false };
    return { ok: true, params };
}

/**
 * Calculate route specificity for conflict resolution
 */
function specificity(segments: Segment[]): number {
    let score = 0;
    for (const seg of segments) {
        if (seg.kind === 'static') score += 100;
        else if (seg.kind === 'param') score += 10;
        else if (seg.kind === 'wildcard') score += 1;
    }
    return score;
}

export interface Router<Ctx = RouteContext, Res = any> {
    use(mw: Middleware<Ctx, Res>): Router<Ctx, Res>
    register(path: string, handler: RouteHandler<Ctx, Res>): Router<Ctx, Res>
    registerAll(map: { [path: string]: RouteHandler<Ctx, Res> }): Router<Ctx, Res>
    mount(prefix: string, sub: Router<Ctx, Res>): Router<Ctx, Res>
    resolve(path: string): { handler: RouteHandler<Ctx, Res>, params: Record<string, string> } | null
    dispatch(path: string, ctx: Ctx): Res
}

/**
 * Create a new router instance
 */
export function createRouter<Ctx = RouteContext, Res = any>(logger?: { info?: (msg: string) => void }): Router<Ctx, Res> {
    const routes: Route<Ctx, Res>[] = [];
    const middlewares: Middleware<Ctx, Res>[] = [];
    
    return {
        use(mw: Middleware<Ctx, Res>): Router<Ctx, Res> {
            middlewares.push(mw);
            return this;
        },
        
        register(path: string, handler: RouteHandler<Ctx, Res>): Router<Ctx, Res> {
            const segments = parsePath(path);
            routes.push({ path, segments, handler });
            
            // Sort routes by specificity (most specific first)
            routes.sort((a, b) => specificity(b.segments) - specificity(a.segments));
            
            logger?.info?.(`[Router] registered route: ${path}`);
            return this;
        },
        
        registerAll(map: { [path: string]: RouteHandler<Ctx, Res> }): Router<Ctx, Res> {
            for (const [path, handler] of Object.entries(map)) {
                this.register(path, handler);
            }
            return this;
        },
        
        mount(_prefix: string, _sub: Router<Ctx, Res>): Router<Ctx, Res> {
            // Simplified mount implementation
            logger?.info?.(`[Router] mounted sub-router at: ${_prefix}`);
            return this;
        },
        
        resolve(path: string): { handler: RouteHandler<Ctx, Res>, params: Record<string, string> } | null {
            if (!path.startsWith('/')) path = '/' + path;
            const parts = path.split('/').filter(x => x.length > 0);
            
            for (const route of routes) {
                const match = matchSegments(route.segments, parts);
                if (match.ok) {
                    return { handler: route.handler, params: match.params };
                }
            }
            
            return null;
        },
        
        dispatch(path: string, ctx: Ctx): Res {
            const resolved = this.resolve(path);
            if (!resolved) {
                throw new Error(`No route found for path: ${path}`);
            }
            
            // Apply middlewares
            let finalHandler = resolved.handler;
            for (let i = middlewares.length - 1; i >= 0; i--) {
                const mw = middlewares[i];
                const currentHandler = finalHandler;
                finalHandler = (ctx: Ctx) => mw(ctx, () => currentHandler(ctx));
            }
            
            // Merge route params into context
            const contextWithParams = { ...ctx, params: { ...(ctx as any).params, ...resolved.params } };
            
            logger?.info?.(`[Router] dispatching to route: ${path}`);
            return finalHandler(contextWithParams);
        }
    };
}