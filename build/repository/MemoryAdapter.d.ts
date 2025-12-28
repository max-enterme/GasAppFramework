/**
 * Repository Module - Memory Adapter
 * In-memory storage adapter for Repository
 * Useful for testing and temporary data storage
 */
import type * as RepositoryTypes from './Types';
/**
 * In-memory implementation of Repository.Ports.Store
 * Stores entities in a simple array with index-based access
 */
export declare class MemoryStore<TEntity extends object> implements RepositoryTypes.Ports.Store<TEntity> {
    private arr;
    /**
     * Load all entities from memory
     */
    load(): {
        rows: TEntity[];
    };
    /**
     * Append new entities to the end of the array
     */
    saveAdded(rows: TEntity[]): void;
    /**
     * Update entities at specific indexes
     */
    saveUpdated(rows: {
        index: number;
        row: TEntity;
    }[]): void;
    /**
     * Delete entities by marking and compacting the array
     */
    deleteByIndexes(indexes: number[]): void;
}
//# sourceMappingURL=MemoryAdapter.d.ts.map