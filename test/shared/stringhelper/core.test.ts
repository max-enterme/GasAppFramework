/**
 * StringHelper 共通テストケース
 * このファイルは GAS と Node.js 両方で実行される
 */

import * as Test from '@/testing/Test';
import * as Assert from '@/testing/Assert';
import * as StringHelper from '@/string-helper';

Test.it('formatString: 単一プレースホルダー', () => {
  const result = StringHelper.formatString('Hello {0}!', 'World');
  Assert.equals(result, 'Hello World!', 'プレースホルダーが置換される');
}, 'StringHelper');

Test.it('formatString: 複数プレースホルダー', () => {
  const result = StringHelper.formatString('{0} is {1} years old', 'John', 25);
  Assert.equals(result, 'John is 25 years old', '複数プレースホルダー');
}, 'StringHelper');

Test.it('formatString: 繰り返しプレースホルダー', () => {
  const result = StringHelper.formatString('{0} loves {0}', 'Alice');
  Assert.equals(result, 'Alice loves Alice', '繰り返しプレースホルダー');
}, 'StringHelper');

Test.it('formatString: 欠落した引数', () => {
  const result = StringHelper.formatString('Hello {0} and {1}!', 'World');
  Assert.equals(result, 'Hello World and {1}!', '欠落引数はそのまま');
}, 'StringHelper');

Test.it('formatString: 数値引数', () => {
  const result = StringHelper.formatString('Price: ${0}', 99.99);
  Assert.equals(result, 'Price: $99.99', '数値引数の処理');
}, 'StringHelper');

Test.it('formatString: 空のテンプレート', () => {
  const result = StringHelper.formatString('', 'arg');
  Assert.equals(result, '', '空のテンプレート');
}, 'StringHelper');

Test.it('formatString: プレースホルダーなし', () => {
  const result = StringHelper.formatString('No placeholders here', 'unused');
  Assert.equals(result, 'No placeholders here', 'プレースホルダーなしの場合');
}, 'StringHelper');

Test.it('formatString: 大量のプレースホルダー', () => {
  const template = Array.from({ length: 20 }, (_, i) => `{${i}}`).join(' ');
  const args = Array.from({ length: 20 }, (_, i) => `arg${i}`);
  const result = StringHelper.formatString(template, ...args);
  Assert.equals(result, args.join(' '), '20個のプレースホルダー処理');
}, 'StringHelper');

Test.it('formatString: 複雑な混合コンテンツ', () => {
  const result = StringHelper.formatString(
    'User {0} ({1}) logged in at {2} from IP {3}',
    'john.doe',
    123,
    '2024-03-15',
    '192.168.1.1'
  );
  Assert.equals(
    result,
    'User john.doe (123) logged in at 2024-03-15 from IP 192.168.1.1',
    '複雑な混合コンテンツ'
  );
}, 'StringHelper');

Test.it('resolveString: ドットパス解決', () => {
  const ctx = { user: { name: 'Alice', roles: ['admin'] } };
  const result = StringHelper.resolveString('Hi {{user.name}}', ctx);
  Assert.equals(result, 'Hi Alice', 'ドットパスが解決される');
}, 'StringHelper');

Test.it('resolveString: 配列アクセス', () => {
  const ctx = { user: { roles: ['admin', 'editor'] } };
  const result = StringHelper.resolveString('Role: {{user.roles[0]}}', ctx);
  Assert.equals(result, 'Role: admin', '配列インデックスアクセス');
}, 'StringHelper');

Test.it('resolveString: 複数プレースホルダー', () => {
  const ctx = { name: 'John', age: 30 };
  const result = StringHelper.resolveString('{{name}} is {{age}} years old', ctx);
  Assert.equals(result, 'John is 30 years old', '複数プレースホルダー解決');
}, 'StringHelper');

Test.it('resolveString: ネストされたプロパティ', () => {
  const ctx = { address: { city: 'New York', country: 'USA' } };
  const result = StringHelper.resolveString('City: {{address.city}}', ctx);
  Assert.equals(result, 'City: New York', 'ネストされたプロパティ');
}, 'StringHelper');

Test.it('resolveString: 欠落したプロパティ', () => {
  const ctx = { name: 'John', age: 30 };
  const result = StringHelper.resolveString('{{name}} has {{missing}} property', ctx);
  Assert.equals(result, 'John has  property', '欠落プロパティは空文字列');
}, 'StringHelper');

Test.it('resolveString: 空のプレースホルダー', () => {
  const ctx = { name: 'Alice' };
  const result = StringHelper.resolveString('{{}} empty', ctx);
  Assert.equals(result, ' empty', '空のプレースホルダー');
}, 'StringHelper');

Test.it('resolveString: 空白を含むプレースホルダー', () => {
  const ctx = { name: 'Bob' };
  const result = StringHelper.resolveString('{{ name }} with spaces', ctx);
  Assert.equals(result, 'Bob with spaces', '空白を含むプレースホルダー');
}, 'StringHelper');

Test.it('resolveString: プレースホルダーなし', () => {
  const ctx = { name: 'Test' };
  const result = StringHelper.resolveString('No placeholders', ctx);
  Assert.equals(result, 'No placeholders', 'プレースホルダーなし');
}, 'StringHelper');

Test.it('get: 存在するパス', () => {
  const ctx = { a: { b: { c: 42 } } };
  const result = StringHelper.get(ctx, 'a.b.c', 0);
  Assert.equals(result, 42, '存在するパスから値を取得');
}, 'StringHelper');

Test.it('get: 存在しないパス（デフォルト値）', () => {
  const ctx = { a: { b: { c: 42 } } };
  const result = StringHelper.get(ctx, 'a.x.c', 99);
  Assert.equals(result, 99, '存在しないパスはデフォルト値');
}, 'StringHelper');

Test.it('get: ネストされた構造', () => {
  const ctx = { user: { profile: { name: 'Alice', settings: { theme: 'dark' } } } };
  const result = StringHelper.get(ctx, 'user.profile.settings.theme');
  Assert.equals(result, 'dark', 'ネストされた構造からの取得');
}, 'StringHelper');

Test.it('get: 配列要素アクセス', () => {
  const ctx = { user: { posts: [{ title: 'First Post' }, { title: 'Second Post' }] } };
  const result = StringHelper.get(ctx, 'user.posts[0].title');
  Assert.equals(result, 'First Post', '配列要素からの取得');
}, 'StringHelper');

Test.it('get: デフォルト値なし（undefined）', () => {
  const ctx = { a: { b: 1 } };
  const result = StringHelper.get(ctx, 'missing.path');
  Assert.isTrue(result === undefined, '存在しないパスはundefined');
}, 'StringHelper');

Test.it('get: null/undefinedオブジェクト', () => {
  const result = StringHelper.get(null, 'any.path', 'fallback');
  Assert.equals(result, 'fallback', 'nullオブジェクトはフォールバック');
}, 'StringHelper');

Test.it('get: 空のパス（ルートオブジェクト）', () => {
  const ctx = { a: 1 };
  const result = StringHelper.get(ctx, '');
  Assert.equals(result, ctx, '空のパスはルートオブジェクト');
}, 'StringHelper');

Test.it('get: 配列インデックスの範囲外', () => {
  const ctx = { items: ['a', 'b', 'c'] };
  const result = StringHelper.get(ctx, 'items[5]');
  Assert.isTrue(result === undefined, '範囲外インデックスはundefined');
}, 'StringHelper');

Test.it('get: 複雑なネスト構造', () => {
  const ctx = {
    data: {
      users: [
        { name: 'John', roles: ['admin', 'user'] },
        { name: 'Jane', roles: ['user'] }
      ]
    }
  };
  const result1 = StringHelper.get(ctx, 'data.users[0].name');
  const result2 = StringHelper.get(ctx, 'data.users[0].roles[0]');
  const result3 = StringHelper.get(ctx, 'data.users[1].roles[0]');
  Assert.equals(result1, 'John', '複雑なネスト1');
  Assert.equals(result2, 'admin', '複雑なネスト2');
  Assert.equals(result3, 'user', '複雑なネスト3');
}, 'StringHelper');
