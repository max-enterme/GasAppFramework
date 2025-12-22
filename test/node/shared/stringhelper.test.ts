/**
 * StringHelper共通テストのNode.js実行ラッパー
 */

import { setupGASMocks } from '../../../src/testing/node/test-utils';
import { formatString, resolveString, get } from '../integration/stringhelper-module';

// GASモックをセットアップ
beforeAll(() => {
  setupGASMocks();
});

describe('StringHelper Core Tests (Shared)', () => {
  describe('formatString', () => {
    test('単一プレースホルダー', () => {
      const result = formatString('Hello {0}!', 'World');
      expect(result).toBe('Hello World!');
    });

    test('複数プレースホルダー', () => {
      const result = formatString('{0} is {1} years old', 'John', 25);
      expect(result).toBe('John is 25 years old');
    });

    test('繰り返しプレースホルダー', () => {
      const result = formatString('{0} loves {0}', 'Alice');
      expect(result).toBe('Alice loves Alice');
    });

    test('欠落した引数', () => {
      const result = formatString('Hello {0} and {1}!', 'World');
      expect(result).toBe('Hello World and {1}!');
    });

    test('数値引数', () => {
      const result = formatString('Price: ${0}', 99.99);
      expect(result).toBe('Price: $99.99');
    });

    test('空のテンプレート', () => {
      const result = formatString('', 'arg');
      expect(result).toBe('');
    });

    test('プレースホルダーなし', () => {
      const result = formatString('No placeholders here', 'unused');
      expect(result).toBe('No placeholders here');
    });
  });

  describe('resolveString', () => {
    test('ドットパス解決', () => {
      const ctx = { user: { name: 'Alice', roles: ['admin'] } };
      const result = resolveString('Hi {{user.name}}', ctx);
      expect(result).toBe('Hi Alice');
    });

    test('配列アクセス', () => {
      const ctx = { user: { roles: ['admin', 'editor'] } };
      const result = resolveString('Role: {{user.roles[0]}}', ctx);
      expect(result).toBe('Role: admin');
    });

    test('複数プレースホルダー', () => {
      const ctx = { name: 'John', age: 30 };
      const result = resolveString('{{name}} is {{age}} years old', ctx);
      expect(result).toBe('John is 30 years old');
    });

    test('ネストされたプロパティ', () => {
      const ctx = { address: { city: 'New York', country: 'USA' } };
      const result = resolveString('City: {{address.city}}', ctx);
      expect(result).toBe('City: New York');
    });
  });

  describe('get', () => {
    test('存在するパス', () => {
      const ctx = { a: { b: { c: 42 } } };
      expect(get(ctx, 'a.b.c', 0)).toBe(42);
    });

    test('存在しないパス（デフォルト値）', () => {
      const ctx = { a: { b: { c: 42 } } };
      expect(get(ctx, 'a.x.c', 99)).toBe(99);
    });

    test('ネストされた構造', () => {
      const ctx = { user: { profile: { name: 'Alice', settings: { theme: 'dark' } } } };
      expect(get(ctx, 'user.profile.settings.theme')).toBe('dark');
    });

    test('配列要素アクセス', () => {
      const ctx = { user: { posts: [{ title: 'First Post' }, { title: 'Second Post' }] } };
      expect(get(ctx, 'user.posts[0].title')).toBe('First Post');
    });
  });
});
