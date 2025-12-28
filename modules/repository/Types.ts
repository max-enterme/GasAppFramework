/**
 * Repository Module - Type Definitions
 */

export namespace Ports {
    /** Schema definition for entity validation and transformation */
    export interface Schema<TEntity extends object, Key extends keyof TEntity> {
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
    export interface KeyCodec<TEntity extends object, Key extends keyof TEntity> {
        stringify(key: Pick<TEntity, Key>): string;
        parse(s: string): Pick<TEntity, Key>;
    }

    /** Storage interface for entity persistence */
    export interface Store<TEntity extends object> {
        load(): { rows: TEntity[] };
        saveAdded(rows: TEntity[]): void;
        saveUpdated(rows: { index: number; row: TEntity }[]): void;
        deleteByIndexes(indexes: number[]): void;
    }
}

export interface Repository<TEntity extends object, Key extends keyof TEntity> {
    load(): void;
    find(key: Pick<TEntity, Key>): TEntity | null;
    findAll(keys: Pick<TEntity, Key>[]): TEntity[];
    upsert(
        input: Partial<TEntity> | Partial<TEntity>[]
    ): { added: TEntity[]; updated: TEntity[] };
    delete(keys: Pick<TEntity, Key> | Pick<TEntity, Key>[]): { deleted: number };
    readonly entities: TEntity[];
}

export type ErrorCode = 'InvalidKey' | 'StoreError' | 'HeaderDuplicate' | 'HeaderMissing';
