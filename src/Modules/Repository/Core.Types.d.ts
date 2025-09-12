declare namespace Repository {
    namespace Ports {
        type ErrorCode = 'InvalidKey' | 'HeaderMissing' | 'HeaderDuplicate' | 'CodecError' | 'StoreError'

        interface Logger { info(msg: string): void; error(msg: string): void }
        interface Clock { now(): Date }

        interface Schema<TEntity extends object, Key extends keyof TEntity> {
            parameters: (keyof TEntity)[]
            keyParameters: Key[]
            primaryParameter?: Key
            optionalParameters?: (keyof TEntity)[]
            instantiate(): TEntity
            fromPartial(p: Partial<TEntity>): TEntity
            onBeforeSave?(e: TEntity): TEntity
            onAfterLoad?(raw: any): TEntity
            schemaVersion?: number
        }

        interface KeyCodec<TEntity extends object, Key extends keyof TEntity> {
            stringify(key: Pick<TEntity, Key>): string
            parse(s: string): Pick<TEntity, Key>
        }

        interface Store<TEntity extends object, Key extends keyof TEntity> {
            load(): { rows: TEntity[] }
            saveAdded(rows: TEntity[]): void
            saveUpdated(rows: { index: number; row: TEntity }[]): void
            deleteByIndexes(indexes: number[]): void
        }
    }
}
