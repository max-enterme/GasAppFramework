/**
 * Locking Module - Type Definitions
 */
export declare namespace Ports {
    interface Clock {
        now(): Date;
    }
    interface Random {
        next(): number;
    }
    interface Logger {
        info(msg: string): void;
        error(msg: string): void;
    }
    interface Store {
        get(key: string): string | null;
        set(key: string, value: string): void;
        del(key: string): void;
    }
}
export type Mode = 'r' | 'w';
export interface AcquireOk {
    ok: true;
    token: string;
    expireIso: string;
    mode: Mode;
    owner: string | null;
}
export interface Fail {
    ok: false;
    reason: string;
}
export interface ExtendOk {
    ok: true;
    expireIso: string;
}
export type AcquireResult = AcquireOk | Fail;
export type ExtendResult = ExtendOk | Fail;
export type ReleaseResult = {
    ok: true;
} | Fail;
export interface LockEngine {
    acquire(resourceId: string, mode: Mode, ttlMs?: number, owner?: string | null): AcquireResult;
    extend(resourceId: string, token: string, ttlMs?: number): ExtendResult;
    release(resourceId: string, token: string): ReleaseResult;
    inspect(resourceId: string): any;
}
//# sourceMappingURL=Types.d.ts.map