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
        const logger = deps.logger ?? { info: (_: string) => { }, error: (_: string) => { } };
        let rows: TEntity[] = [];
        let idx: Idx = new Map();

        /**
         * Extract key from entity based on schema key parameters
         */
        const keyOf = (e: TEntity): Pick<TEntity, Key> => {
            const key: any = {};
            for (const param of deps.schema.keyParameters) {
                key[param as string] = (e as any)[param as string];
            }
            return key;
        };

        /**
         * Serialize key to string for indexing
         */
        const keyToString = (key: Pick<TEntity, Key>): string => {
            return deps.keyCodec.stringify(key);
        };

        /**
         * Rebuild index from current rows
         */
        const buildIndex = () => {
            idx = new Map();
            for (let i = 0; i < rows.length; i++) {
                const key = keyToString(keyOf(rows[i]));
                idx.set(key, i);
            }
        };

        /**
         * Load entities from store and build index
         */
        function load(): void {
            const read = deps.store.load();
            rows = read.rows.map(row => {
                const entity = deps.schema.onAfterLoad ? deps.schema.onAfterLoad(row) : (row as any as TEntity);
                return coerceToSchema(entity);
            });
            buildIndex();
            logger.info(`[Repository] loaded ${rows.length} rows`);
        }

        /**
         * Coerce partial entity to full entity using schema
         */
        function coerceToSchema(partial: Partial<TEntity>): TEntity {
            const entity = deps.schema.fromPartial(partial);
            return deps.schema.onBeforeSave ? deps.schema.onBeforeSave(entity) : entity;
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

        /**
         * Insert or update entities
         */
        function upsert(input: Partial<TEntity> | Partial<TEntity>[]): { added: TEntity[]; updated: TEntity[] } {
            ensureLoaded();
            const items = Array.isArray(input) ? input : [input];
            const added: TEntity[] = [];
            const updated: TEntity[] = [];
            const forStoreAdds: TEntity[] = [];
            const forStoreUpdates: { index: number; row: TEntity }[] = [];

            for (const partial of items) {
                const entity = coerceToSchema(partial);
                const key = keyOf(entity);
                validateKey(key);
                
                const keyStr = keyToString(key);
                const existingIndex = idx.get(keyStr);
                
                if (existingIndex == null) {
                    // Add new entity
                    const newIndex = rows.length;
                    rows.push(entity);
                    idx.set(keyStr, newIndex);
                    added.push(entity);
                    forStoreAdds.push(entity);
                    logger.info(`[Repository] added entity with key: ${keyStr}`);
                } else {
                    // Update existing entity
                    rows[existingIndex] = entity;
                    updated.push(entity);
                    forStoreUpdates.push({ index: existingIndex, row: entity });
                    logger.info(`[Repository] updated entity with key: ${keyStr}`);
                }
            }

            // Persist changes to store
            if (forStoreAdds.length > 0) deps.store.saveAdded(forStoreAdds);
            if (forStoreUpdates.length > 0) deps.store.saveUpdated(forStoreUpdates);
            
            return { added, updated };
        }

        /**
         * Delete entities by keys
         */
        function deleteMany(keys: Pick<TEntity, Key> | Pick<TEntity, Key>[]): { deleted: number } {
            ensureLoaded();
            const keyList = Array.isArray(keys) ? keys : [keys];
            const indicesToDelete: number[] = [];
            
            // Find all entities to delete
            for (const key of keyList) {
                const keyStr = keyToString(key);
                const index = idx.get(keyStr);
                if (index != null) {
                    indicesToDelete.push(index);
                    logger.info(`[Repository] deleted entity with key: ${keyStr}`);
                }
            }
            
            if (indicesToDelete.length === 0) return { deleted: 0 };
            
            // Sort indexes for consistent deletion
            indicesToDelete.sort((a, b) => a - b);
            
            // Mark rows to keep
            const keepRow = new Array(rows.length).fill(true);
            for (const index of indicesToDelete) {
                keepRow[index] = false;
            }
            
            // Compact rows array
            const newRows: TEntity[] = [];
            for (let i = 0; i < rows.length; i++) {
                if (keepRow[i]) newRows.push(rows[i]);
            }
            
            rows = newRows;
            buildIndex();
            deps.store.deleteByIndexes(indicesToDelete);
            
            return { deleted: indicesToDelete.length };
        }

        /**
         * Ensure data is loaded before operations
         */
        function ensureLoaded() {
            if (rows.length === 0 && idx.size === 0) load();
        }

        /**
         * Validate that all key parts are present
         */
        function validateKey(key: Pick<TEntity, Key>) {
            for (const param of deps.schema.keyParameters) {
                const value = (key as any)[param as string];
                if (value == null || value === '') {
                    throw new Repository.RepositoryError('InvalidKey', `key part "${String(param)}" is missing`);
                }
            }
        }

        const result = {
            load,
            find,
            findAll,
            upsert,
            delete: deleteMany,
            get entities() {
                ensureLoaded();
                return rows;
            }
        };

        return result;
    }
}
