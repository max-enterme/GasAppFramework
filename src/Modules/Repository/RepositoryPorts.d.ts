/**
 * Repository domain and port interfaces
 */
declare namespace Repository {
    namespace Ports {
        /** Schema definition for entity validation and transformation */
        interface Schema<TEntity extends object, Key extends keyof TEntity> {
            parameters: (keyof TEntity)[];
            keyParameters: Key[];
            primaryParameter?: Key;
            optionalParameters?: (keyof TEntity)[];
            instantiate(): TEntity;
            fromPartial(p: Partial<TEntity>): TEntity;
            onBeforeSave?(e: TEntity): TEntity;
            onAfterLoad?(raw: any): TEntity;
            schemaVersion?: number;
        }

        /** Key encoding/decoding for entity keys */
        interface KeyCodec<TEntity extends object, Key extends keyof TEntity> {
            stringify(key: Pick<TEntity, Key>): string;
            parse(s: string): Pick<TEntity, Key>;
        }

        /** Storage interface for entity persistence */
        interface Store<TEntity extends object> {
            load(): { rows: TEntity[] };
            saveAdded(rows: TEntity[]): void;
            saveUpdated(rows: { index: number; row: TEntity }[]): void;
            deleteByIndexes(indexes: number[]): void;
        }
    }
}