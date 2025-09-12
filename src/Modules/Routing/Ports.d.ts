declare namespace Routing {
    namespace Ports {
        type Handler<Ctx=any, Res=any> = (ctx: Ctx) => Res
        type Middleware<Ctx=any, Res=any> = (next: Handler<Ctx, Res>, ctx: Ctx) => Res
        interface Logger { info(msg: string): void; error(msg: string): void }
    }
}
