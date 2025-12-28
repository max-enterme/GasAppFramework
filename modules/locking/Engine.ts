/**
 * Locking Module - Engine Implementation
 */

import type * as LockingTypes from './Types';
import type { Clock, Random, Logger } from '../shared/index';

type Entry = {
    token: string;
    owner: string | null;
    mode: LockingTypes.Mode;
    expireMs: number;
};

type State = {
    version: number;
    entries: Entry[];
};

const DEFAULT_TTL = 30000;

export type Deps = {
    store: LockingTypes.Ports.Store;
    clock: Clock;
    rand?: Random;
    logger?: Logger;
    namespace?: string; // storage key prefix, default 'lock:'
};

function keyOf(ns: string, resourceId: string): string {
    return `${ns}${resourceId}`;
}

function parse(json: string | null): State {
    if (!json) return { version: 1, entries: [] };
    try {
        const s = JSON.parse(json);
        if (!s || !Array.isArray(s.entries)) return { version: 1, entries: [] };
        return {
            version: typeof s.version === 'number' ? s.version : 1,
            entries: (s.entries as any[]).map((e) => ({
                token: String(e.token),
                owner: e.owner == null ? null : String(e.owner),
                mode: e.mode === 'w' ? 'w' : 'r',
                expireMs: Number(e.expireMs) || 0,
            })),
        };
    } catch {
        return { version: 1, entries: [] };
    }
}

function serialize(s: State): string {
    return JSON.stringify(s);
}

function gc(s: State, nowMs: number): State {
    return { ...s, entries: s.entries.filter((e) => e.expireMs > nowMs) };
}

function genToken(resourceId: string, rand: Random | undefined, nowMs: number): string {
    const r = rand ? rand.next() : Math.random();
    return `${resourceId}-${nowMs}-${Math.floor(r * 1e9)}`;
}

export function create(deps: Deps): LockingTypes.LockEngine {
    const ns = deps.namespace ?? 'lock:';

    function acquire(
        resourceId: string,
        mode: LockingTypes.Mode,
        ttlMs = DEFAULT_TTL,
        owner: string | null = null
    ): LockingTypes.AcquireResult {
        try {
            const now = deps.clock.now().getTime();
            const key = keyOf(ns, resourceId);
            const st = gc(parse(deps.store.get(key)), now);

            // admission
            if (mode === 'r') {
                const hasWriter = st.entries.some((e) => e.mode === 'w');
                if (hasWriter) return { ok: false, reason: 'writer-present' };
            } else {
                // 'w'
                const hasAny = st.entries.length > 0;
                if (hasAny) return { ok: false, reason: 'busy' };
            }

            const token = genToken(resourceId, deps.rand, now);
            st.entries.push({ token, owner, mode, expireMs: now + Math.max(1, ttlMs) });
            deps.store.set(key, serialize(st));
            const expireIso = new Date(now + Math.max(1, ttlMs)).toISOString();

            if (deps.logger) {
                deps.logger.info(
                    `Lock acquired for resource ${resourceId} (${mode}) by ${owner || 'anonymous'}`
                );
            }

            return { ok: true, token, expireIso, mode, owner };
        } catch (error) {
            if (deps.logger) {
                deps.logger.error('Properties service error');
            }
            throw error;
        }
    }

    function extend(
        resourceId: string,
        token: string,
        ttlMs = DEFAULT_TTL
    ): LockingTypes.ExtendResult {
        const now = deps.clock.now().getTime();
        const key = keyOf(ns, resourceId);
        const st = gc(parse(deps.store.get(key)), now);
        const idx = st.entries.findIndex((e) => e.token === token);
        if (idx < 0) return { ok: false, reason: 'not-held' };
        st.entries[idx].expireMs = now + Math.max(1, ttlMs);
        deps.store.set(key, serialize(st));
        return { ok: true, expireIso: new Date(st.entries[idx].expireMs).toISOString() };
    }

    function release(resourceId: string, token: string): LockingTypes.ReleaseResult {
        const now = deps.clock.now().getTime();
        const key = keyOf(ns, resourceId);
        const st = gc(parse(deps.store.get(key)), now);
        const next = { ...st, entries: st.entries.filter((e) => e.token !== token) };
        if (next.entries.length === st.entries.length) return { ok: false, reason: 'not-held' };
        deps.store.set(key, serialize(next));
        return { ok: true };
    }

    function inspect(resourceId: string): any {
        const now = deps.clock.now().getTime();
        const key = keyOf(ns, resourceId);
        return gc(parse(deps.store.get(key)), now);
    }

    return { acquire, extend, release, inspect };
}
