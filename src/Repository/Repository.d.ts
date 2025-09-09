declare namespace Repository {
    interface Schema<TEntity extends object, TKey extends keyof TEntity> {
        readonly parameters: (keyof TEntity)[];
        readonly keyParameters: TKey[];
        readonly primaryParameter: keyof TEntity;

        instantiateEntity(): TEntity;
        instantiateEntityByParameter(parameter: Required<TEntity>): TEntity;
    }

    interface Repository<TEntity extends object, TKey extends keyof TEntity> {
        readonly entities: TEntity[];

        load(): void;
        find(key: Pick<TEntity, TKey>): TEntity;
        findAll(keys: Pick<TEntity, TKey>[]): TEntity[];
        update(entities: Required<TEntity> | Required<TEntity>[]): { added: TEntity[], updated: TEntity[] };
    }
}
