/// <reference path="../global-test-types.d.ts" />

/**
 * Locking 共通テストケース
 * このファイルは GAS と Node.js 両方で実行される
 */

// 共通テストケースを関数として export
export function registerLockingCoreTests() {

  class MemStore implements Locking.Ports.Store {
    private m = new Map<string, string>();
    get(k: string) { return this.m.get(k) ?? null; }
    set(k: string, v: string) { this.m.set(k, v); }
    del(k: string) { this.m.delete(k); }
  }

  class FixedClock implements Locking.Ports.Clock {
    constructor(private t: number) { }
    now(): Date { return new Date(this.t); }
  }

  class Rand implements Locking.Ports.Random {
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

  T.it('Reader: Writerがいない時に取得可能', () => {
    const eng = createEngine();
    const r1 = eng.acquire('docA', 'r', 10000, 'u1');
    TAssert.isTrue(r1.ok === true, 'reader1は取得できる');
  }, 'Locking');

  T.it('Reader: 複数のReaderは共存可能', () => {
    const eng = createEngine();
    const r1 = eng.acquire('docA', 'r', 10000, 'u1');
    const r2 = eng.acquire('docA', 'r', 10000, 'u2');
    TAssert.isTrue(r1.ok === true && r2.ok === true, '複数のreaderが共存できる');
  }, 'Locking');

  T.it('Writer: Readerがいる時は拒否される', () => {
    const eng = createEngine();
    const r1 = eng.acquire('docA', 'r', 10000, 'u1');
    const w1 = eng.acquire('docA', 'w', 10000, 'u2');
    TAssert.isTrue(r1.ok === true && w1.ok === false, 'writerは拒否される');
  }, 'Locking');

  T.it('Writer: 他のWriterがいる時は拒否される', () => {
    const eng = createEngine();
    const w1 = eng.acquire('docA', 'w', 10000, 'u1');
    const w2 = eng.acquire('docA', 'w', 10000, 'u2');
    TAssert.isTrue(w1.ok === true && w2.ok === false, '2番目のwriterは拒否される');
  }, 'Locking');

  T.it('Writer: 誰もいない時は取得可能', () => {
    const eng = createEngine();
    const w1 = eng.acquire('docA', 'w', 10000, 'u1');
    TAssert.isTrue(w1.ok === true, 'writerが取得できる');
  }, 'Locking');

  T.it('extend: ロックの延長', () => {
    const eng = createEngine();
    const w = eng.acquire('docB', 'w', 10000, 'u9');
    if (!w.ok) TAssert.fail('writerは取得できるはず');

    const ex = eng.extend('docB', (w as Locking.AcquireOk).token, 20000);
    TAssert.isTrue(ex.ok === true, 'extendが成功');
  }, 'Locking');

  T.it('release: ロックの解放', () => {
    const eng = createEngine();
    const w = eng.acquire('docB', 'w', 10000, 'u9');
    if (!w.ok) TAssert.fail('writerは取得できるはず');

    const rl = eng.release('docB', (w as Locking.AcquireOk).token);
    TAssert.isTrue(rl.ok === true, 'releaseが成功');
  }, 'Locking');

  T.it('release後: 他のユーザーがロック取得可能', () => {
    const eng = createEngine();
    const w1 = eng.acquire('docC', 'w', 10000, 'u1');
    if (!w1.ok) TAssert.fail('writer1は取得できるはず');

    eng.release('docC', (w1 as Locking.AcquireOk).token);

    const w2 = eng.acquire('docC', 'w', 10000, 'u2');
    TAssert.isTrue(w2.ok === true, 'release後は別のwriterが取得できる');
  }, 'Locking');

  T.it('異なるドキュメントのロックは独立', () => {
    const eng = createEngine();
    const w1 = eng.acquire('docA', 'w', 10000, 'u1');
    const w2 = eng.acquire('docB', 'w', 10000, 'u2');
    TAssert.isTrue(w1.ok === true && w2.ok === true, '異なるドキュメントは独立');
  }, 'Locking');

  T.it('無効なトークンでextendは失敗', () => {
    const eng = createEngine();
    const ex = eng.extend('docX', 'invalid-token', 20000);
    TAssert.isTrue(ex.ok === false, '無効なトークンでextendは失敗');
  }, 'Locking');

  T.it('無効なトークンでreleaseは失敗', () => {
    const eng = createEngine();
    const rl = eng.release('docY', 'invalid-token');
    TAssert.isTrue(rl.ok === false, '無効なトークンでreleaseは失敗');
  }, 'Locking');
}

// GAS環境では即座に登録
if (typeof T !== 'undefined') {
  registerLockingCoreTests();
}
