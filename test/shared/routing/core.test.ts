/**
 * Routing 共通テストケース
 * このファイルは GAS と Node.js 両方で実行される
 */

// 共通テストケースを関数として export
export function registerRoutingCoreTests() {
  
  T.it('静的ルートの登録とディスパッチ', () => {
    const r = Routing.create();
    r.register('/hello', (_ctx: any) => 'world');
    const out = r.dispatch('/hello', {} as any);
    TAssert.equals(out, 'world', 'ハンドラー結果を返す');
  }, 'Routing');

  T.it('複数の静的ルート', () => {
    const r = Routing.create();
    r.register('/api/status', () => ({ status: 'ok' }));
    r.register('/api/health', () => ({ health: 'good' }));
    
    const statusResult = r.dispatch('/api/status', {} as any);
    const healthResult = r.dispatch('/api/health', {} as any);
    
    TAssert.equals((statusResult as any).status, 'ok', 'status route');
    TAssert.equals((healthResult as any).health, 'good', 'health route');
  }, 'Routing');

  T.it('パラメータマッチング: :id', () => {
    const r = Routing.create();
    r.register('/user/:id', (ctx: any) => `user#${ctx.params.id}`);
    const result = r.dispatch('/user/42', {} as any);
    TAssert.equals(result, 'user#42', 'パラメータidがキャプチャされる');
  }, 'Routing');

  T.it('パラメータマッチング: 複数パラメータ', () => {
    const r = Routing.create();
    r.register('/org/:orgId/user/:userId', (ctx: any) => 
      `org=${ctx.params.orgId}, user=${ctx.params.userId}`
    );
    const result = r.dispatch('/org/acme/user/123', {} as any);
    TAssert.equals(result, 'org=acme, user=123', '複数パラメータのキャプチャ');
  }, 'Routing');

  T.it('ワイルドカードマッチング: *', () => {
    const r = Routing.create();
    r.register('/files/*', (ctx: any) => `file:${ctx.params['*']}`);
    const result = r.dispatch('/files/a/b/c.txt', {} as any);
    TAssert.equals(result, 'file:a/b/c.txt', 'ワイルドカードキャプチャ');
  }, 'Routing');

  T.it('ミドルウェアチェーン', () => {
    const r = Routing.create();
    const seq: string[] = [];
    
    r.use((next, ctx: any) => { 
      seq.push('mw1'); 
      return next(ctx); 
    });
    r.use((next, ctx: any) => { 
      seq.push('mw2'); 
      return next(ctx); 
    });
    
    r.register('/test', () => 'result');
    
    r.dispatch('/test', {} as any);
    r.dispatch('/test', {} as any);
    
    TAssert.equals(seq.join(','), 'mw1,mw2,mw1,mw2', 'ミドルウェアが順番に実行される');
  }, 'Routing');

  T.it('マウント機能: ネストされたルーター', () => {
    const api = Routing.create();
    api.register('/v1/ping', (_: any) => 'pong');
    
    const root = Routing.create();
    root.mount('/api', api);
    
    const result = root.dispatch('/api/v1/ping', {} as any);
    TAssert.equals(result, 'pong', 'マウントされたルーターが動作する');
  }, 'Routing');

  T.it('resolve: 見つからない場合はnull', () => {
    const r = Routing.create();
    r.register('/exists', () => 'found');
    
    const found = r.resolve('/exists');
    const notFound = r.resolve('/not-exists');
    
    TAssert.isTrue(found !== null, '存在するルートはnullでない');
    TAssert.isTrue(notFound === null, '存在しないルートはnull');
  }, 'Routing');

  T.it('dispatch: 見つからない場合は例外', () => {
    const r = Routing.create();
    TAssert.throws(
      () => r.dispatch('/not-found', {} as any),
      '404でdispatchは例外を投げる'
    );
  }, 'Routing');

  T.it('パラメータと静的セグメントの混在', () => {
    const r = Routing.create();
    r.register('/api/:version/users/:id', (ctx: any) => 
      `${ctx.params.version}:${ctx.params.id}`
    );
    const result = r.dispatch('/api/v2/users/456', {} as any);
    TAssert.equals(result, 'v2:456', '混在パラメータの処理');
  }, 'Routing');
}

// GAS環境では即座に登録
if (typeof T !== 'undefined') {
  registerRoutingCoreTests();
}
