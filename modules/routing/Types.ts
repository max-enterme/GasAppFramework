/**
 * Routing Module - Type Definitions
 */

export namespace Ports {
    export type Handler<Ctx = any, Res = any> = (ctx: Ctx) => Res;
    export type Middleware<Ctx = any, Res = any> = (ctx: Ctx, next: () => Res) => Res;
    export interface Logger {
        info(msg: string): void;
        error(msg: string): void;
    }
}

export interface Router<Ctx = any, Res = any> {
    use(mw: Ports.Middleware<Ctx, Res>): Router<Ctx, Res>;
    register(path: string, handler: Ports.Handler<Ctx, Res>): Router<Ctx, Res>;
    registerAll(map: { [path: string]: Ports.Handler<Ctx, Res> }): Router<Ctx, Res>;
    mount(prefix: string, sub: Router<Ctx, Res>): Router<Ctx, Res>;
    resolve(path: string): { handler: Ports.Handler<Ctx, Res>; params: any } | null;
    dispatch(path: string, ctx: Ctx): Res;
}
