declare namespace Locking {
    namespace Ports {
        interface Clock { now(): Date }
        interface Random { next(): number } // 0..1
        interface Logger { info(msg: string): void; error(msg: string): void }
        interface Store {
            get(key: string): string | null
            set(key: string, value: string): void
            del(key: string): void
        }
    }

    type Mode = 'r' | 'w'

    interface AcquireOk {
        ok: true
        token: string
        expireIso: string
    }
    interface Fail {
        ok: false
        reason: string
    }
    interface ExtendOk {
        ok: true
        expireIso: string
    }
    type AcquireResult = AcquireOk | Fail
    type ExtendResult = ExtendOk | Fail
    type ReleaseResult = { ok: true } | Fail
}
