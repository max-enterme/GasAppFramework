declare namespace Routing {
    namespace Ports {
        type Handler<Ctx = any, Res = any> = (ctx: Ctx) => Res
        type Middleware<Ctx = any, Res = any> = (next: Handler<Ctx, Res>, ctx: Ctx) => Res
        interface Logger { info(msg: string): void; error(msg: string): void }
    }

    interface Router<Ctx = any, Res = any> {
        use(mw: Routing.Ports.Middleware<Ctx, Res>): Router<Ctx, Res>;
        register(path: string, handler: Routing.Ports.Handler<Ctx, Res>): Router<Ctx, Res>;
        registerAll(map: { [path: string]: Routing.Ports.Handler<Ctx, Res> }): Router<Ctx, Res>;
        mount(prefix: string, sub: Router<Ctx, Res>): Router<Ctx, Res>;
        resolve(path: string): { handler: Routing.Ports.Handler<Ctx, Res>, params: any } | null;
        dispatch(path: string, ctx: Ctx): Res;
    }
}
