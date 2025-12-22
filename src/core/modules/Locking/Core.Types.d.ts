type Brand<K, B> = K & { readonly __brand?: B };
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
        mode: Mode
        owner: string | null
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

    interface LockEngine {
        acquire(resourceId: string, mode: Locking.Mode, ttlMs?: number, owner?: string | null): Locking.AcquireResult;
        extend(resourceId: string, token: string, ttlMs?: number): Locking.ExtendResult;
        release(resourceId: string, token: string): Locking.ReleaseResult;
        inspect(resourceId: string): any;
    }
}
