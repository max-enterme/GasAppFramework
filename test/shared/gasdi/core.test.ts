/**
 * GasDI 共通テストケース
 * このファイルは GAS と Node.js 両方で実行される
 */

import * as Test from '../../../modules/testing/Test';
import * as Assert from '../../../modules/testing/Assert';
import * as GasDI from '../../../modules/di';

Test.it('値の登録と解決', () => {
  const c = new GasDI.Container();
  c.registerValue('pi', 3.14);
  const a = c.resolve<number>('pi');
  Assert.equals(a, 3.14, '値が解決される');
}, 'GasDI');

Test.it('ファクトリ: transientライフタイム', () => {
  const c = new GasDI.Container();
  c.registerFactory('now', () => ({ t: Math.random() }), 'transient');
  const n1 = c.resolve<{ t: number }>('now');
  const n2 = c.resolve<{ t: number }>('now');
  Assert.isTrue(n1 !== n2, 'transientは毎回新しいインスタンス');
}, 'GasDI');

Test.it('ファクトリ: singletonライフタイム', () => {
  const c = new GasDI.Container();
  c.registerFactory('cfg', () => ({ a: 1 }), 'singleton');
  const g1 = c.resolve<{ a: number }>('cfg');
  const g2 = c.resolve<{ a: number }>('cfg');
  Assert.isTrue(g1 === g2, 'singletonは同じインスタンス');
}, 'GasDI');

Test.it('ファクトリ: scopedライフタイム - 同じスコープ', () => {
  const root = new GasDI.Container();
  root.registerFactory('req', () => ({ id: Math.random() }), 'scoped');
  const s1 = root.createScope('req-1');
  const a1 = s1.resolve<any>('req');
  const a2 = s1.resolve<any>('req');
  Assert.isTrue(a1 === a2, '同じスコープでは同じインスタンス');
}, 'GasDI');

Test.it('ファクトリ: scopedライフタイム - 異なるスコープ', () => {
  const root = new GasDI.Container();
  root.registerFactory('req', () => ({ id: Math.random() }), 'scoped');
  const s1 = root.createScope('req-1');
  const s2 = root.createScope('req-2');
  const a1 = s1.resolve<any>('req');
  const b1 = s2.resolve<any>('req');
  Assert.isTrue(a1 !== b1, '異なるスコープでは異なるインスタンス');
}, 'GasDI');

Test.it('スコープの作成と管理', () => {
  const root = new GasDI.Container();
  root.registerValue('rootValue', 100);
  const scope = root.createScope('test-scope');
  const value = scope.resolve<number>('rootValue');
  Assert.equals(value, 100, 'スコープから親の値を解決できる');
}, 'GasDI');

Test.it('複数の値とファクトリの混在', () => {
  const c = new GasDI.Container();
  c.registerValue('name', 'Test');
  c.registerValue('version', 1);
  c.registerFactory('service', () => ({ initialized: true }), 'singleton');

  Assert.equals(c.resolve<string>('name'), 'Test', 'name解決');
  Assert.equals(c.resolve<number>('version'), 1, 'version解決');
  Assert.equals(c.resolve<any>('service').initialized, true, 'service解決');
}, 'GasDI');

Test.it('未登録のトークンの解決は例外', () => {
  const c = new GasDI.Container();
  Assert.throws(
    () => c.resolve('unknown'),
    '未登録のトークンは例外'
  );
}, 'GasDI');

Test.it('ファクトリの依存解決', () => {
  const c = new GasDI.Container();
  c.registerValue('config', { url: 'https://api.example.com' });
  c.registerFactory('client', () => {
    const cfg = c.resolve<any>('config');
    return { endpoint: cfg.url };
  }, 'singleton');

  const client = c.resolve<any>('client');
  Assert.equals(client.endpoint, 'https://api.example.com', 'ファクトリ内で依存解決');
}, 'GasDI');

Test.it('スコープのチェーン解決', () => {
  const root = new GasDI.Container();
  root.registerValue('global', 'global-value');

  const scope1 = root.createScope('scope1');
  const scope2 = scope1.createScope('scope2');

  const value = scope2.resolve<string>('global');
  Assert.equals(value, 'global-value', '孫スコープから親の値を解決');
}, 'GasDI');
