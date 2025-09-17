export interface Repository<TEntity extends object, Key extends keyof TEntity> {
  load(): void;
  find(key: Pick<TEntity, Key>): TEntity | null;
  findAll(keys: Pick<TEntity, Key>[]): TEntity[];
  upsert(input: Partial<TEntity> | Partial<TEntity>[]): { added: TEntity[]; updated: TEntity[] };
  delete(keys: Pick<TEntity, Key> | Pick<TEntity, Key>[]): { deleted: number };
  readonly entities: TEntity[];
}