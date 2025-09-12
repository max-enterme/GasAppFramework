/// <reference path="../../_framework/Assert.ts" />
/// <reference path="../../_framework/Test.ts" />
/// <reference path="../../_framework/Runner.ts" />
/// <reference path="../../_framework/GasReporter.ts" />
/// <reference path="../../../src/Modules/Routing/Ports.d.ts" />
/// <reference path="../../../src/Modules/Routing/Engine.ts" />

namespace RoutingSpec {
    T.it('register and dispatch static route', () => {
        const r = Routing.create()
        r.register('/hello', (ctx:any) => 'world')
        const out = r.dispatch('/hello', {} as any)
        TAssert.equals(out, 'world', 'should return handler result')
    })

    T.it('param and wildcard matching with middleware', () => {
        const r = Routing.create()
        const seq:string[]=[]
        r.use((next,ctx:any)=>{ seq.push('mw1'); return next(ctx) })
        r.use((next,ctx:any)=>{ seq.push('mw2'); return next(ctx) })

        r.register('/user/:id', (ctx:any)=> `user#${ctx.params.id}`)
        r.register('/files/*', (ctx:any)=> `file:${ctx.params['*']}`)

        const a = r.dispatch('/user/42', {} as any)
        const b = r.dispatch('/files/a/b/c.txt', {} as any)

        TAssert.equals(a, 'user#42', 'param id captured')
        TAssert.equals(b, 'file:a/b/c.txt', 'wildcard captured')
        TAssert.equals(seq.join(','), 'mw1,mw2,mw1,mw2', 'mw executed per dispatch in order')
    })

    T.it('resolve returns null when not found; dispatch throws', () => {
        const r = Routing.create()
        TAssert.isTrue(r.resolve('/x') === null, 'resolve null for missing')
        TAssert.throws(()=> r.dispatch('/x', {} as any), 'dispatch should throw on 404')
    })

    T.it('mount nests routers', () => {
        const api = Routing.create()
        api.register('/v1/ping', (_:any)=> 'pong')
        const root = Routing.create()
        root.mount('/api', api)
        const out = root.dispatch('/api/v1/ping', {} as any)
        TAssert.equals(out, 'pong', 'mounted router works')
    })
}
