namespace Repository.Adapters.Memory {
    export class Store<TEntity extends object, Key extends keyof TEntity> implements Repository.Ports.Store<TEntity, Key> {
        private arr: TEntity[] = []
        load(): { rows: TEntity[] } { return { rows: this.arr.slice() } }
        saveAdded(rows: TEntity[]): void { this.arr.push(...rows) }
        saveUpdated(rows: { index: number; row: TEntity }[]): void {
            for (const r of rows) this.arr[r.index] = r.row
        }
        deleteByIndexes(indexes: number[]): void {
            const mark = new Array(this.arr.length).fill(true)
            for (const i of indexes) mark[i] = false
            const next: TEntity[] = []
            for (let i = 0; i < this.arr.length; i++) if (mark[i]) next.push(this.arr[i])
            this.arr = next
        }
    }
}
