/**
 * Routing 共通テストケース
 * このファイルは GAS と Node.js 両方で実行される
 */

import * as Test from '@/testing/Test';
import * as Assert from '@/testing/Assert';
import * as Routing from '@/routing';

Test.it('静的ルートの登録とディスパッチ', () => {
  const r = Routing.create();
  r.register('/hello', (_ctx: any) => 'world');
  const out = r.dispatch('/hello', {} as any);
  Assert.equals(out, 'world', 'ハンドラー結果を返す');
}, 'Routing');

Test.it('複数の静的ルート', () => {
  const r = Routing.create();
  r.register('/api/status', () => ({ status: 'ok' }));
  r.register('/api/health', () => ({ health: 'good' }));

  const statusResult = r.dispatch('/api/status', {} as any);
  const healthResult = r.dispatch('/api/health', {} as any);

  Assert.equals((statusResult as any).status, 'ok', 'status route');
  Assert.equals((healthResult as any).health, 'good', 'health route');
}, 'Routing');

Test.it('パラメータマッチング: :id', () => {
  const r = Routing.create();
  r.register('/user/:id', (ctx: any) => `user#${ctx.params.id}`);
  const result = r.dispatch('/user/42', {} as any);
  Assert.equals(result, 'user#42', 'パラメータidがキャプチャされる');
}, 'Routing');

Test.it('パラメータマッチング: 複数パラメータ', () => {
  const r = Routing.create();
  r.register('/org/:orgId/user/:userId', (ctx: any) =>
    `org=${ctx.params.orgId}, user=${ctx.params.userId}`
  );
  const result = r.dispatch('/org/acme/user/123', {} as any);
  Assert.equals(result, 'org=acme, user=123', '複数パラメータのキャプチャ');
}, 'Routing');

Test.it('ワイルドカードマッチング: *', () => {
  const r = Routing.create();
  r.register('/files/*', (ctx: any) => `file:${ctx.params['*']}`);
  const result = r.dispatch('/files/a/b/c.txt', {} as any);
  Assert.equals(result, 'file:a/b/c.txt', 'ワイルドカードキャプチャ');
}, 'Routing');

Test.it('ミドルウェアチェーン', () => {
  const r = Routing.create();
  const seq: string[] = [];

  r.use((ctx: any, next) => {
    seq.push('mw1');
    return next();
  });
  r.use((ctx: any, next) => {
    seq.push('mw2');
    return next();
  });

  r.register('/test', () => 'result');

  r.dispatch('/test', {} as any);
  r.dispatch('/test', {} as any);

  Assert.equals(seq.join(','), 'mw1,mw2,mw1,mw2', 'ミドルウェアが順番に実行される');
}, 'Routing');

Test.it('マウント機能: ネストされたルーター', () => {
  const api = Routing.create();
  api.register('/v1/ping', (_: any) => 'pong');

  const root = Routing.create();
  root.mount('/api', api);

  const result = root.dispatch('/api/v1/ping', {} as any);
  Assert.equals(result, 'pong', 'マウントされたルーターが動作する');
}, 'Routing');

Test.it('resolve: 見つからない場合はnull', () => {
  const r = Routing.create();
  r.register('/exists', () => 'found');

  const found = r.resolve('/exists');
  const notFound = r.resolve('/not-exists');

  Assert.isTrue(found !== null, '存在するルートはnullでない');
  Assert.isTrue(notFound === null, '存在しないルートはnull');
}, 'Routing');

Test.it('dispatch: 見つからない場合は例外', () => {
  const r = Routing.create();
  Assert.throws(
    () => r.dispatch('/not-found', {} as any),
    '404でdispatchは例外を投げる'
  );
}, 'Routing');

Test.it('パラメータと静的セグメントの混在', () => {
  const r = Routing.create();
  r.register('/api/:version/users/:id', (ctx: any) =>
    `${ctx.params.version}:${ctx.params.id}`
  );
  const result = r.dispatch('/api/v2/users/456', {} as any);
  Assert.equals(result, 'v2:456', '混在パラメータの処理');
}, 'Routing');

Test.it('URLエンコードされたパラメータ', () => {
  const r = Routing.create();
  r.register('/search/:query', (ctx: any) => `Query: ${ctx.params.query}`);
  const result1 = r.dispatch('/search/hello%20world', {} as any);
  const result2 = r.dispatch('/search/hello%2Bworld', {} as any);
  Assert.equals(result1, 'Query: hello world', 'スペースのデコード');
  Assert.equals(result2, 'Query: hello+world', 'プラス記号のデコード');
}, 'Routing');

Test.it('既存コンテキストパラメータの保持', () => {
  const r = Routing.create();
  r.register('/api/:version', (ctx: any) => ({
    version: ctx.params.version,
    existing: ctx.params.existing
  }));
  const result = r.dispatch('/api/v1', { params: { existing: 'value' } } as any);
  Assert.equals((result as any).version, 'v1', '新しいパラメータ');
  Assert.equals((result as any).existing, 'value', '既存のパラメータを保持');
}, 'Routing');

Test.it('ルートの優先順位（静的 > パラメータ > ワイルドカード）', () => {
  const r = Routing.create();
  r.register('/*', () => 'wildcard');
  r.register('/api/:action', () => 'param');
  r.register('/api/status', () => 'static');

  Assert.equals(r.dispatch('/api/status', {} as any), 'static', '静的ルートが優先');
  Assert.equals(r.dispatch('/api/users', {} as any), 'param', 'パラメータルートが次点');
  Assert.equals(r.dispatch('/other/path', {} as any), 'wildcard', 'ワイルドカードが最後');
}, 'Routing');

Test.it('registerAll: 複数ルートの一括登録', () => {
  const r = Routing.create();
  r.registerAll({
    '/api/users': () => 'users',
    '/api/products': () => 'products',
    '/api/orders': () => 'orders'
  });

  Assert.equals(r.dispatch('/api/users', {} as any), 'users', 'users route');
  Assert.equals(r.dispatch('/api/products', {} as any), 'products', 'products route');
  Assert.equals(r.dispatch('/api/orders', {} as any), 'orders', 'orders route');
}, 'Routing');

Test.it('パスの正規化（先頭スラッシュなし）', () => {
  const r = Routing.create();
  r.register('api/test', () => 'normalized');
  const result = r.dispatch('/api/test', {} as any);
  Assert.equals(result, 'normalized', 'スラッシュなしで登録されても動作する');
}, 'Routing');

Test.it('ミドルウェアによるコンテキスト変更', () => {
  const r = Routing.create();
  r.use((ctx: any, next) => {
    ctx.user = { id: 'user123', role: 'admin' };
    return next();
  });
  r.register('/secure', (ctx: any) => ({
    message: 'secure data',
    user: ctx.user
  }));

  const result = r.dispatch('/secure', {} as any);
  Assert.equals((result as any).message, 'secure data', 'ハンドラー実行');
  Assert.equals((result as any).user.id, 'user123', 'ミドルウェアでコンテキスト変更');
}, 'Routing');

Test.it('ハンドラーエラーの伝播', () => {
  const r = Routing.create();
  r.register('/error', () => {
    throw new Error('Handler error');
  });

  Assert.throws(
    () => r.dispatch('/error', {} as any),
    'ハンドラーのエラーが伝播する'
  );
}, 'Routing');

Test.it('複雑なRESTルーティング', () => {
  const r = Routing.create();
  r.registerAll({
    '/api/users': () => ({ action: 'list_users' }),
    '/api/users/:id': (ctx: any) => ({ action: 'get_user', id: ctx.params.id }),
    '/api/users/:id/posts': (ctx: any) => ({ action: 'user_posts', userId: ctx.params.id }),
    '/api/users/:userId/posts/:postId': (ctx: any) => ({
      action: 'get_post',
      userId: ctx.params.userId,
      postId: ctx.params.postId
    })
  });

  const result1 = r.dispatch('/api/users', {} as any);
  const result2 = r.dispatch('/api/users/123', {} as any);
  const result3 = r.dispatch('/api/users/123/posts', {} as any);
  const result4 = r.dispatch('/api/users/123/posts/456', {} as any);

  Assert.equals((result1 as any).action, 'list_users', 'リスト取得');
  Assert.equals((result2 as any).action, 'get_user', 'ユーザー取得');
  Assert.equals((result3 as any).action, 'user_posts', 'ユーザー投稿');
  Assert.equals((result4 as any).action, 'get_post', '投稿取得');
}, 'Routing');
