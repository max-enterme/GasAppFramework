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
export class MemoryStore<TEntity extends object>
    implements RepositoryTypes.Ports.Store<TEntity>
{
    private arr: TEntity[] = [];

    /**
     * Load all entities from memory
     */
    load(): { rows: TEntity[] } {
        return { rows: this.arr.slice() };
    }

    /**
     * Append new entities to the end of the array
     */
    saveAdded(rows: TEntity[]): void {
        this.arr.push(...rows);
    }

    /**
     * Update entities at specific indexes
     */
    saveUpdated(rows: { index: number; row: TEntity }[]): void {
        for (const r of rows) {
            this.arr[r.index] = r.row;
        }
    }

    /**
     * Delete entities by marking and compacting the array
     */
    deleteByIndexes(indexes: number[]): void {
        const keepRow = new Array(this.arr.length).fill(true);

        // Mark rows to delete
        for (const idx of indexes) {
            keepRow[idx] = false;
        }

        // Compact array by keeping only marked rows
        const newArr: TEntity[] = [];
        for (let i = 0; i < this.arr.length; i++) {
            if (keepRow[i]) newArr.push(this.arr[i]);
        }

        this.arr = newArr;
    }
}
