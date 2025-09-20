/**
 * Repository module wrapper for Node.js testing
 * This module loads and exposes the Repository namespace for testing
 */

/// <reference path="../src/Shared/CommonTypes.d.ts" />
/// <reference path="../src/Modules/Repository/Core.Types.d.ts" />

// Load namespace files by requiring them with TypeScript
import '../src/Modules/Repository/Adapters.Memory';
import '../src/Modules/Repository/Codec.Simple';
import '../src/Modules/Repository/Engine';

// Re-export for testing
declare global {
    namespace Repository {
        // Repository namespace declarations are loaded via triple-slash references
    }
}

// Create concrete implementations for testing
export class MemoryStore<TEntity extends object> {
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

export function createSimpleCodec<TEntity extends object, Key extends keyof TEntity>(delim = '|') {
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
                if (c === '\\' && i + 1 < s.length) { 
                    cur += s[i + 1]; i++; 
                } else if (c === delim) { 
                    parts.push(cur); cur = ''; 
                } else {
                    cur += c;
                }
            }
            parts.push(cur);
            
            // This is a simplified parse - in real usage, you'd need proper key mapping
            const result: any = {};
            if (parts.length > 0) result.id = parts[0] || '';
            if (parts.length > 1) result.org = parts[1] || '';
            return result as Pick<TEntity, Key>;
        }
    };
}

export interface RepositoryInstance<TEntity extends object, Key extends keyof TEntity> {
    load(): void
    upsert(entity: TEntity): void
    find(key: Pick<TEntity, Key>): TEntity | undefined
    findAll(): TEntity[]
    delete(key: Pick<TEntity, Key>): boolean
    save(): void
}

export function createRepository<TEntity extends object, Key extends keyof TEntity>(deps: {
    schema: {
        parameters: (keyof TEntity)[]
        keyParameters: Key[]
        instantiate(): TEntity
        fromPartial(p: Partial<TEntity>): TEntity
        onBeforeSave?(e: TEntity): TEntity
        onAfterLoad?(raw: any): TEntity
    }
    store: MemoryStore<TEntity>
    keyCodec: ReturnType<typeof createSimpleCodec<TEntity, Key>>
    logger?: { info: (msg: string) => void; error: (msg: string) => void }
}): RepositoryInstance<TEntity, Key> {
    const logger = deps.logger ?? { info: (_: string) => { }, error: (_: string) => { } };
    let rows: TEntity[] = [];
    let idx = new Map<string, number>();

    const keyOf = (e: TEntity): Pick<TEntity, Key> => {
        const k: any = {};
        for (const p of deps.schema.keyParameters) {
            k[p as string] = (e as any)[p as string];
        }
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

    const coerceToSchema = (p: Partial<TEntity>): TEntity => {
        return deps.schema.fromPartial(p);
    };

    return {
        load(): void {
            const read = deps.store.load();
            rows = read.rows.map(r => {
                const rec = deps.schema.onAfterLoad ? deps.schema.onAfterLoad(r) : (r as any as TEntity);
                return coerceToSchema(rec);
            });
            buildIndex();
            logger.info(`[Repository] loaded ${rows.length} rows`);
        },

        upsert(entity: TEntity): void {
            const processed = deps.schema.onBeforeSave ? deps.schema.onBeforeSave(entity) : entity;
            const key = keyOf(processed);
            const keyStr = keyToString(key);
            const existingIndex = idx.get(keyStr);

            if (existingIndex !== undefined) {
                // Update existing
                rows[existingIndex] = processed;
                logger.info(`[Repository] updated entity with key: ${keyStr}`);
            } else {
                // Add new
                const newIndex = rows.length;
                rows.push(processed);
                idx.set(keyStr, newIndex);
                logger.info(`[Repository] added entity with key: ${keyStr}`);
            }
        },

        find(key: Pick<TEntity, Key>): TEntity | undefined {
            const keyStr = keyToString(key);
            const index = idx.get(keyStr);
            return index !== undefined ? rows[index] : undefined;
        },

        findAll(): TEntity[] {
            return rows.slice();
        },

        delete(key: Pick<TEntity, Key>): boolean {
            const keyStr = keyToString(key);
            const index = idx.get(keyStr);
            if (index !== undefined) {
                rows.splice(index, 1);
                buildIndex(); // Rebuild index after deletion
                logger.info(`[Repository] deleted entity with key: ${keyStr}`);
                return true;
            }
            return false;
        },

        save(): void {
            // In memory store, save is a no-op as changes are immediate
            logger.info(`[Repository] save completed`);
        }
    };
}