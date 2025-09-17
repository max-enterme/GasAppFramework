import type { Routing } from './Ports';

export interface Router<Ctx = any, Res = any> {
  use(mw: Routing.Ports.Middleware<Ctx, Res>): Router<Ctx, Res>;
  register(path: string, handler: Routing.Ports.Handler<Ctx, Res>): Router<Ctx, Res>;
  registerAll(map: { [path: string]: Routing.Ports.Handler<Ctx, Res> }): Router<Ctx, Res>;
  mount(prefix: string, sub: Router<Ctx, Res>): Router<Ctx, Res>;
  resolve(path: string): { handler: Routing.Ports.Handler<Ctx, Res>, params: any } | null;
  dispatch(path: string, ctx: Ctx): Res;
}