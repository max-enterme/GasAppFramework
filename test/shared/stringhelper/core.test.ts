/**
 * StringHelper 共通テストケース
 * このファイルは GAS と Node.js 両方で実行される
 */

// 共通テストケースを関数として export
export function registerStringHelperCoreTests() {
  
  T.it('formatString: 単一プレースホルダー', () => {
    const result = StringHelper.formatString('Hello {0}!', 'World');
    TAssert.equals(result, 'Hello World!', 'プレースホルダーが置換される');
  }, 'StringHelper');

  T.it('formatString: 複数プレースホルダー', () => {
    const result = StringHelper.formatString('{0} is {1} years old', 'John', 25);
    TAssert.equals(result, 'John is 25 years old', '複数プレースホルダー');
  }, 'StringHelper');

  T.it('formatString: 繰り返しプレースホルダー', () => {
    const result = StringHelper.formatString('{0} loves {0}', 'Alice');
    TAssert.equals(result, 'Alice loves Alice', '繰り返しプレースホルダー');
  }, 'StringHelper');

  T.it('formatString: 欠落した引数', () => {
    const result = StringHelper.formatString('Hello {0} and {1}!', 'World');
    TAssert.equals(result, 'Hello World and {1}!', '欠落引数はそのまま');
  }, 'StringHelper');

  T.it('formatString: 数値引数', () => {
    const result = StringHelper.formatString('Price: ${0}', 99.99);
    TAssert.equals(result, 'Price: $99.99', '数値引数の処理');
  }, 'StringHelper');

  T.it('formatString: 空のテンプレート', () => {
    const result = StringHelper.formatString('', 'arg');
    TAssert.equals(result, '', '空のテンプレート');
  }, 'StringHelper');

  T.it('formatString: プレースホルダーなし', () => {
    const result = StringHelper.formatString('No placeholders here', 'unused');
    TAssert.equals(result, 'No placeholders here', 'プレースホルダーなしの場合');
  }, 'StringHelper');

  T.it('resolveString: ドットパス解決', () => {
    const ctx = { user: { name: 'Alice', roles: ['admin'] } };
    const result = StringHelper.resolveString('Hi {{user.name}}', ctx);
    TAssert.equals(result, 'Hi Alice', 'ドットパスが解決される');
  }, 'StringHelper');

  T.it('resolveString: 配列アクセス', () => {
    const ctx = { user: { roles: ['admin', 'editor'] } };
    const result = StringHelper.resolveString('Role: {{user.roles[0]}}', ctx);
    TAssert.equals(result, 'Role: admin', '配列インデックスアクセス');
  }, 'StringHelper');

  T.it('resolveString: 複数プレースホルダー', () => {
    const ctx = { name: 'John', age: 30 };
    const result = StringHelper.resolveString('{{name}} is {{age}} years old', ctx);
    TAssert.equals(result, 'John is 30 years old', '複数プレースホルダー解決');
  }, 'StringHelper');

  T.it('resolveString: ネストされたプロパティ', () => {
    const ctx = { address: { city: 'New York', country: 'USA' } };
    const result = StringHelper.resolveString('City: {{address.city}}', ctx);
    TAssert.equals(result, 'City: New York', 'ネストされたプロパティ');
  }, 'StringHelper');

  T.it('get: 存在するパス', () => {
    const ctx = { a: { b: { c: 42 } } };
    const result = StringHelper.get(ctx, 'a.b.c', 0);
    TAssert.equals(result, 42, '存在するパスから値を取得');
  }, 'StringHelper');

  T.it('get: 存在しないパス（デフォルト値）', () => {
    const ctx = { a: { b: { c: 42 } } };
    const result = StringHelper.get(ctx, 'a.x.c', 99);
    TAssert.equals(result, 99, '存在しないパスはデフォルト値');
  }, 'StringHelper');

  T.it('get: ネストされた構造', () => {
    const ctx = { user: { profile: { name: 'Alice', settings: { theme: 'dark' } } } };
    const result = StringHelper.get(ctx, 'user.profile.settings.theme');
    TAssert.equals(result, 'dark', 'ネストされた構造からの取得');
  }, 'StringHelper');

  T.it('get: 配列要素アクセス', () => {
    const ctx = { user: { posts: [{ title: 'First Post' }, { title: 'Second Post' }] } };
    const result = StringHelper.get(ctx, 'user.posts[0].title');
    TAssert.equals(result, 'First Post', '配列要素からの取得');
  }, 'StringHelper');
}

// GAS環境では即座に登録
if (typeof T !== 'undefined') {
  registerStringHelperCoreTests();
}
