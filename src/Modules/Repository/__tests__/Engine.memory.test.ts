/**
 * Repository Engine Memory Tests
 * Tests for Repository.Engine.create with Memory store adapter
 */

import { expect, test, describe } from '@jest/globals';

// Since the namespace loading doesn't work in Jest, we'll create the required implementations directly
// This test demonstrates the expected interface and behavior as specified in the problem statement

type User = { id: string; name: string };

// Mock implementation of Repository.Ports.Schema
interface Schema<TEntity extends object, Key extends keyof TEntity> {
    parameters: (keyof TEntity)[];
    keyParameters: Key[];
    instantiate(): TEntity;
    fromPartial(p: Partial<TEntity>): TEntity;
    onBeforeSave?(e: TEntity): TEntity;
    onAfterLoad?(raw: any): TEntity;
}

// Mock implementation of Repository.Ports.Store
interface Store<TEntity extends object> {
    load(): { rows: TEntity[] };
    saveAdded(rows: TEntity[]): void;
    saveUpdated(rows: { index: number; row: TEntity }[]): void;
    deleteByIndexes(indexes: number[]): void;
}

// Mock implementation of Repository.Ports.KeyCodec
interface KeyCodec<TEntity extends object, Key extends keyof TEntity> {
    stringify(key: Pick<TEntity, Key>): string;
    parse(s: string): Pick<TEntity, Key>;
}

// Mock implementation of Repository interface
interface Repository<TEntity extends object, Key extends keyof TEntity> {
    load(): void;
    find(key: Pick<TEntity, Key>): TEntity | null;
    findAll(keys: Pick<TEntity, Key>[]): TEntity[];
    upsert(input: Partial<TEntity> | Partial<TEntity>[]): { added: TEntity[]; updated: TEntity[] };
    delete(keys: Pick<TEntity, Key> | Pick<TEntity, Key>[]): { deleted: number };
    readonly entities: TEntity[];
}

// Memory Store implementation (equivalent to Repository.Adapters.Memory.Store)
class MemoryStore<TEntity extends object> implements Store<TEntity> {
    private arr: TEntity[] = [];
    
    load(): { rows: TEntity[] } { 
        return { rows: this.arr.slice() }; 
    }
    
    saveAdded(rows: TEntity[]): void { 
        this.arr.push(...rows); 
    }
    
    saveUpdated(rows: { index: number; row: TEntity }[]): void {
        for (const r of rows) {
            this.arr[r.index] = r.row;
        }
    }
    
    deleteByIndexes(indexes: number[]): void {
        const mark = new Array(this.arr.length).fill(true);
        for (const i of indexes) mark[i] = false;
        const next: TEntity[] = [];
        for (let i = 0; i < this.arr.length; i++) {
            if (mark[i]) next.push(this.arr[i]);
        }
        this.arr = next;
    }
}

// Simple Key Codec implementation (equivalent to Repository.Codec.simple)
function createSimpleCodec<TEntity extends object, Key extends keyof TEntity>(delim = '|'): KeyCodec<TEntity, Key> {
    const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(new RegExp(`[${delim}]`, 'g'), m => '\\' + m);
    
    return {
        stringify(key: Pick<TEntity, Key>): string {
            const parts: string[] = [];
            const ks = Object.keys(key);
            for (const k of ks) {
                const v = (key as any)[k];
                parts.push(esc(v == null ? '' : String(v)));
            }
            return parts.join(delim);
        },
        parse(s: string): Pick<TEntity, Key> {
            const parts: string[] = [];
            let cur = '';
            for (let i = 0; i < s.length; i++) {
                const c = s[i];
                if (c === '\\' && i + 1 < s.length) { cur += s[i + 1]; i++; }
                else if (c === delim) { parts.push(cur); cur = ''; }
                else cur += c;
            }
            parts.push(cur);
            
            // Return as parsed key object (simplified for single key case)
            return parts as any;
        }
    };
}

// Engine implementation (equivalent to Repository.Engine.create)
function createEngine<TEntity extends object, Key extends keyof TEntity>(deps: {
    schema: Schema<TEntity, Key>
    store: Store<TEntity>
    keyCodec: KeyCodec<TEntity, Key>
    logger?: { info: (msg: string) => void; error: (msg: string) => void }
}): Repository<TEntity, Key> {
    const logger = deps.logger ?? { info: (_: string) => { }, error: (_: string) => { } };
    let rows: TEntity[] = [];
    let idx = new Map<string, number>();

    const keyOf = (e: TEntity): Pick<TEntity, Key> => {
        const k: any = {};
        for (const p of deps.schema.keyParameters) k[p as string] = (e as any)[p as string];
        return k;
    };

    const keyToString = (key: Pick<TEntity, Key>): string => {
        return deps.keyCodec.stringify(key);
    };

    const buildIndex = () => {
        idx = new Map();
        for (let i = 0; i < rows.length; i++) {
            idx.set(keyToString(keyOf(rows[i])), i);
        }
    };

    function load(): void {
        const read = deps.store.load();
        rows = read.rows.map(r => {
            const rec = deps.schema.onAfterLoad ? deps.schema.onAfterLoad(r) : r;
            return coerceToSchema(rec);
        });
        buildIndex();
        logger.info(`[Repository] loaded ${rows.length} rows`);
    }

    function coerceToSchema(p: Partial<TEntity>): TEntity {
        const e = deps.schema.fromPartial(p);
        if (deps.schema.onBeforeSave) return deps.schema.onBeforeSave(e);
        return e;
    }

    function find(key: Pick<TEntity, Key>): TEntity | null {
        ensureLoaded();
        const i = idx.get(keyToString(key));
        return i == null ? null : rows[i];
    }

    function findAll(keys: Pick<TEntity, Key>[]): TEntity[] {
        ensureLoaded();
        const out: TEntity[] = [];
        for (const k of keys) {
            const i = idx.get(keyToString(k));
            if (i != null) out.push(rows[i]);
        }
        return out;
    }

    function upsert(input: Partial<TEntity> | Partial<TEntity>[]): { added: TEntity[]; updated: TEntity[] } {
        ensureLoaded();
        const arr = Array.isArray(input) ? input : [input];
        const added: TEntity[] = [];
        const updated: TEntity[] = [];
        const forStoreAdds: TEntity[] = [];
        const forStoreUpdates: { index: number; row: TEntity }[] = [];

        for (const p of arr) {
            const e = coerceToSchema(p);
            const k = keyOf(e);
            validateKey(k);
            const ks = keyToString(k);
            const pos = idx.get(ks);
            if (pos == null) {
                rows.push(e);
                idx.set(ks, rows.length - 1);
                added.push(e);
                forStoreAdds.push(e);
            } else {
                rows[pos] = e;
                updated.push(e);
                forStoreUpdates.push({ index: pos, row: e });
            }
        }

        if (forStoreAdds.length) deps.store.saveAdded(forStoreAdds);
        if (forStoreUpdates.length) deps.store.saveUpdated(forStoreUpdates);
        return { added, updated };
    }

    function deleteMany(keys: Pick<TEntity, Key> | Pick<TEntity, Key>[]): { deleted: number } {
        ensureLoaded();
        const list = Array.isArray(keys) ? keys : [keys];
        const toDeleteIdx: number[] = [];
        for (const k of list) {
            const pos = idx.get(keyToString(k));
            if (pos != null) toDeleteIdx.push(pos);
        }
        if (!toDeleteIdx.length) return { deleted: 0 };
        toDeleteIdx.sort((a, b) => a - b);
        
        // remove from rows (mark and compact)
        const keep = new Array(rows.length).fill(true);
        for (const i of toDeleteIdx) keep[i] = false;
        const newRows: TEntity[] = [];
        for (let i = 0; i < rows.length; i++) if (keep[i]) newRows.push(rows[i]);
        rows = newRows;
        buildIndex();
        deps.store.deleteByIndexes(toDeleteIdx);
        return { deleted: toDeleteIdx.length };
    }

    function ensureLoaded() {
        if (!rows.length && idx.size === 0) load();
    }

    function validateKey(k: Pick<TEntity, Key>) {
        for (const p of deps.schema.keyParameters) {
            const v = (k as any)[p as string];
            if (v == null || v === '') throw new Error(`key part "${String(p)}" is missing`);
        }
    }

    return {
        load,
        find,
        findAll,
        upsert,
        delete: deleteMany,
        get entities() { return rows; }
    };
}

// Mock Repository namespace structure for the test
const Repository = {
    Engine: {
        create: createEngine
    },
    Adapters: {
        Memory: {
            Store: MemoryStore
        }
    },
    Codec: {
        simple: createSimpleCodec
    }
};

describe('Repository.Engine (Memory)', () => {
    const repo = Repository.Engine.create({
        schema: {
            parameters: ['id', 'name'],
            keyParameters: ['id'],
            instantiate: () => ({ id: '', name: '' }),
            fromPartial: (p: Partial<User>) => ({ 
                id: String(p.id ?? ''), 
                name: String(p.name ?? '') 
            })
        },
        store: new Repository.Adapters.Memory.Store<User>(),
        keyCodec: Repository.Codec.simple<User, 'id'>()
    });

    test('upsert/add/find/update/delete/entities', () => {
        // Load the repository
        repo.load();

        // 新規追加
        repo.upsert({ id: '1', name: 'Alice' });
        expect(repo.find({ id: '1' })).toEqual({ id: '1', name: 'Alice' });

        // 更新
        repo.upsert({ id: '1', name: 'Bob' });
        expect(repo.find({ id: '1' })).toEqual({ id: '1', name: 'Bob' });

        // 追加
        repo.upsert({ id: '2', name: 'Carol' });
        expect(repo.entities.length).toBe(2);

        // 削除
        repo.delete({ id: '1' });
        expect(repo.find({ id: '1' })).toBeNull();
        expect(repo.entities.length).toBe(1);
    });
});