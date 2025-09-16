namespace Spec_Locking {
    class MemStore implements Locking.Ports.Store {
        private m = new Map<string, string>()
        get(k: string) { return this.m.get(k) ?? null }
        set(k: string, v: string) { this.m.set(k, v) }
        del(k: string) { this.m.delete(k) }
    }
    class FixedClock implements Locking.Ports.Clock {
        constructor(private t: number) { }
        now(): Date { return new Date(this.t) }
    }
    class Rand implements Locking.Ports.Random {
        next(): number { return Math.random(); }
        uuid(): string { return 'stub-uuid'; }
    }

    T.it('reader can acquire when no writer', () => {
        const eng = Locking.Engine.create({ store: new MemStore(), clock: new FixedClock(Date.now()), rand: new Rand() })
        const r1 = eng.acquire('docA', 'r', 10000, 'u1')
        TAssert.isTrue(r1.ok === true, 'reader1 should acquire')
    })

    T.it('writer denied when readers exist', () => {
        const eng = Locking.Engine.create({ store: new MemStore(), clock: new FixedClock(Date.now()), rand: new Rand() })
        const r1 = eng.acquire('docA', 'r', 10000, 'u1')
        const w1 = eng.acquire('docA', 'w', 10000, 'u2')
        TAssert.isTrue(r1.ok === true && w1.ok === false, 'writer should be denied')
    })

    T.it('extend and release work', () => {
        const eng = Locking.Engine.create({ store: new MemStore(), clock: new FixedClock(Date.now()), rand: new Rand() })
        const w = eng.acquire('docB', 'w', 10000, 'u9')
        if (!w.ok) TAssert.fail('writer should acquire')
        const ex = eng.extend('docB', w.token, 20000)
        TAssert.isTrue(ex.ok === true, 'extend ok')
        const rl = eng.release('docB', w.token)
        TAssert.isTrue(rl.ok === true, 'release ok')
    })
}
