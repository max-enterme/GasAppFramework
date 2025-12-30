/**
 * Locking 共通テストケース
 * このファイルは GAS と Node.js 両方で実行される
 */

import * as Test from '../../../modules/testing/Test';
import * as Assert from '../../../modules/testing/Assert';
import * as Locking from '../../../modules/locking';

class MemStore implements Locking.Types.Ports.Store {
  private m = new Map<string, string>();
  get(k: string) { return this.m.get(k) ?? null; }
  set(k: string, v: string) { this.m.set(k, v); }
  del(k: string) { this.m.delete(k); }
}

class FixedClock implements Locking.Types.Ports.Clock {
  constructor(private t: number) { }
  now(): Date { return new Date(this.t); }
}

class Rand implements Locking.Types.Ports.Random {
  next(): number { return Math.random(); }
  uuid(): string { return 'stub-uuid'; }
}

const createEngine = () => {
  return Locking.Engine.create({
    store: new MemStore(),
    clock: new FixedClock(Date.now()),
    rand: new Rand()
  });
};

Test.it('Reader: Writerがいない時に取得可能', () => {
  const eng = createEngine();
  const r1 = eng.acquire('docA', 'r', 10000, 'u1');
  Assert.isTrue(r1.ok === true, 'reader1は取得できる');
}, 'Locking');

Test.it('Reader: 複数のReaderは共存可能', () => {
  const eng = createEngine();
  const r1 = eng.acquire('docA', 'r', 10000, 'u1');
  const r2 = eng.acquire('docA', 'r', 10000, 'u2');
  Assert.isTrue(r1.ok === true && r2.ok === true, '複数のreaderが共存できる');
}, 'Locking');

Test.it('Writer: Readerがいる時は拒否される', () => {
  const eng = createEngine();
  const r1 = eng.acquire('docA', 'r', 10000, 'u1');
  const w1 = eng.acquire('docA', 'w', 10000, 'u2');
  Assert.isTrue(r1.ok === true && w1.ok === false, 'writerは拒否される');
}, 'Locking');

Test.it('Writer: 他のWriterがいる時は拒否される', () => {
  const eng = createEngine();
  const w1 = eng.acquire('docA', 'w', 10000, 'u1');
  const w2 = eng.acquire('docA', 'w', 10000, 'u2');
  Assert.isTrue(w1.ok === true && w2.ok === false, '2番目のwriterは拒否される');
}, 'Locking');

Test.it('Writer: 誰もいない時は取得可能', () => {
  const eng = createEngine();
  const w1 = eng.acquire('docA', 'w', 10000, 'u1');
  Assert.isTrue(w1.ok === true, 'writerが取得できる');
}, 'Locking');

Test.it('extend: ロックの延長', () => {
  const eng = createEngine();
  const w = eng.acquire('docB', 'w', 10000, 'u9');
  if (!w.ok) Assert.fail('writerは取得できるはず');

  const ex = eng.extend('docB', (w as Locking.Types.AcquireOk).token, 20000);
  Assert.isTrue(ex.ok === true, 'extendが成功');
}, 'Locking');

Test.it('release: ロックの解放', () => {
  const eng = createEngine();
  const w = eng.acquire('docB', 'w', 10000, 'u9');
  if (!w.ok) Assert.fail('writerは取得できるはず');

  const rl = eng.release('docB', (w as Locking.Types.AcquireOk).token);
  Assert.isTrue(rl.ok === true, 'releaseが成功');
}, 'Locking');

Test.it('release後: 他のユーザーがロック取得可能', () => {
  const eng = createEngine();
  const w1 = eng.acquire('docC', 'w', 10000, 'u1');
  if (!w1.ok) Assert.fail('writer1は取得できるはず');

  eng.release('docC', (w1 as Locking.Types.AcquireOk).token);

  const w2 = eng.acquire('docC', 'w', 10000, 'u2');
  Assert.isTrue(w2.ok === true, 'release後は別のwriterが取得できる');
}, 'Locking');

Test.it('異なるドキュメントのロックは独立', () => {
  const eng = createEngine();
  const w1 = eng.acquire('docA', 'w', 10000, 'u1');
  const w2 = eng.acquire('docB', 'w', 10000, 'u2');
  Assert.isTrue(w1.ok === true && w2.ok === true, '異なるドキュメントは独立');
}, 'Locking');

Test.it('無効なトークンでextendは失敗', () => {
  const eng = createEngine();
  const ex = eng.extend('docX', 'invalid-token', 20000);
  Assert.isTrue(ex.ok === false, '無効なトークンでextendは失敗');
}, 'Locking');

Test.it('無効なトークンでreleaseは失敗', () => {
  const eng = createEngine();
  const rl = eng.release('docY', 'invalid-token');
  Assert.isTrue(rl.ok === false, '無効なトークンでreleaseは失敗');
}, 'Locking');
