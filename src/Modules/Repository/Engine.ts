/**
 * Repository Engine - Core repository functionality
 */

namespace Repository.Engine {
    type Idx = Map<string, number>

    /**
     * Creates a repository instance with the provided dependencies
     * @param deps Configuration object with schema, store, codec, and optional logger
     * @returns Repository instance with CRUD operations
     */
    export function create<TEntity extends object, Key extends keyof TEntity>(deps: {
        schema: Repository.Ports.Schema<TEntity, Key>
        store: Repository.Ports.Store<TEntity>
        keyCodec: Repository.Ports.KeyCodec<TEntity, Key>
        logger?: Shared.Types.Logger
    }): Repository<TEntity, Key> {
        const logger = deps.logger ?? { info: (_: string) => { }, error: (_: string) => { } }
        let rows: TEntity[] = []
        let idx: Idx = new Map()

        const keyOf = (e: TEntity): Pick<TEntity, Key> => {
            const k: any = {}
            for (const p of deps.schema.keyParameters) k[p as string] = (e as any)[p as string]
            return k
        }

        const keyToString = (key: Pick<TEntity, Key>): string => {
            return deps.keyCodec.stringify(key)
        }

        const buildIndex = () => {
            idx = new Map()
            for (let i = 0; i < rows.length; i++) {
                idx.set(keyToString(keyOf(rows[i])), i)
            }
        }

        function load(): void {
            const read = deps.store.load()
            rows = read.rows.map(r => {
                const rec = deps.schema.onAfterLoad ? deps.schema.onAfterLoad(r) : (r as any as TEntity)
                return coerceToSchema(rec)
            })
            buildIndex()
            logger.info(`[Repository] loaded ${rows.length} rows`)
        }

        function coerceToSchema(p: Partial<TEntity>): TEntity {
            const e = deps.schema.fromPartial(p)
            if (deps.schema.onBeforeSave) return deps.schema.onBeforeSave(e)
            return e
        }

        function find(key: Pick<TEntity, Key>): TEntity | null {
            ensureLoaded()
            const i = idx.get(keyToString(key))
            return i == null ? null : rows[i]
        }

        function findAll(keys: Pick<TEntity, Key>[]): TEntity[] {
            ensureLoaded()
            const out: TEntity[] = []
            for (const k of keys) {
                const i = idx.get(keyToString(k))
                if (i != null) out.push(rows[i])
            }
            return out
        }

        function upsert(input: Partial<TEntity> | Partial<TEntity>[]): { added: TEntity[]; updated: TEntity[] } {
            ensureLoaded()
            const arr = Array.isArray(input) ? input : [input]
            const added: TEntity[] = []
            const updated: TEntity[] = []
            const forStoreAdds: TEntity[] = []
            const forStoreUpdates: { index: number; row: TEntity }[] = []

            for (const p of arr) {
                const e = coerceToSchema(p)
                const k = keyOf(e)
                validateKey(k)
                const ks = keyToString(k)
                const pos = idx.get(ks)
                if (pos == null) {
                    rows.push(e)
                    idx.set(ks, rows.length - 1)
                    added.push(e)
                    forStoreAdds.push(e)
                } else {
                    rows[pos] = e
                    updated.push(e)
                    forStoreUpdates.push({ index: pos, row: e })
                }
            }

            if (forStoreAdds.length) deps.store.saveAdded(forStoreAdds)
            if (forStoreUpdates.length) deps.store.saveUpdated(forStoreUpdates)
            return { added, updated }
        }

        function deleteMany(keys: Pick<TEntity, Key> | Pick<TEntity, Key>[]): { deleted: number } {
            ensureLoaded()
            const list = Array.isArray(keys) ? keys : [keys]
            const toDeleteIdx: number[] = []
            for (const k of list) {
                const pos = idx.get(keyToString(k))
                if (pos != null) toDeleteIdx.push(pos)
            }
            if (!toDeleteIdx.length) return { deleted: 0 }
            toDeleteIdx.sort((a, b) => a - b)
            // remove from rows (mark and compact)
            const keep = new Array(rows.length).fill(true)
            for (const i of toDeleteIdx) keep[i] = false
            const newRows: TEntity[] = []
            for (let i = 0; i < rows.length; i++) if (keep[i]) newRows.push(rows[i])
            rows = newRows
            buildIndex()
            deps.store.deleteByIndexes(toDeleteIdx)
            return { deleted: toDeleteIdx.length }
        }

        function ensureLoaded() {
            if (!rows.length && idx.size === 0) load()
        }

        function validateKey(k: Pick<TEntity, Key>) {
            for (const p of deps.schema.keyParameters) {
                const v = (k as any)[p as string]
                if (v == null || v === '') throw new Repository.RepositoryError('InvalidKey', `key part "${String(p)}" is missing`)
            }
        }

        const result = {
            load,
            find,
            findAll,
            upsert,
            delete: deleteMany,
            get entities() { return rows }
        }

        return result
    }
}
