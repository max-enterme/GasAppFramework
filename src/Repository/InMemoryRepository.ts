namespace Repository {
    export class InMemoryRepository<TEntity extends object, TKey extends keyof TEntity> implements Repository<TEntity, TKey> {
        protected readonly _schema: Schema<TEntity, TKey>;

        protected _parameterMap: Map<string, number>;

        protected readonly _entities: TEntity[] = [];
        protected readonly _entityMap: Map<string, number> = new Map();

        public get entities(): TEntity[] {
            this.validateAccess();
            return this._entities.slice();
        }

        public constructor(schema: SpreadsheetRepository<TEntity, TKey>['_schema'], entities: Required<TEntity>[] = []) {
            this._schema = schema;
            if (entities.length > 0) {
                this.updateInteranl(entities);
            }
        }

        private loaded = false;

        public load(): void {
            this.loaded = true;
        }

        private validateAccess() {
            if (!this.loaded) {
                throw new Error("Error: Repository not loaded. Please call the `load` method before accessing the repository.");
            }
        }

        public find(key: Pick<TEntity, TKey>): TEntity {
            this.validateAccess();
            const keyText = this.createKeyText(key);
            const index = this._entityMap.get(keyText);
            return this._entities[index];
        }

        public findAll(keys: Pick<TEntity, TKey>[]): TEntity[] {
            this.validateAccess();
            return keys.map(x => this.find(x)).filter(x => x);
        }

        public update(entities: Required<TEntity> | Required<TEntity>[]): { added: TEntity[]; updated: TEntity[]; } {
            this.validateAccess();
            return this.updateInteranl(entities);
        }

        protected updateInteranl(entities: Required<TEntity> | Required<TEntity>[]): { added: TEntity[]; updated: TEntity[]; } {
            if (!Array.isArray(entities)) {
                entities = [entities];
            }

            // 分類
            const addedEntites = new Map<string, TEntity>();
            const updatedEntites = new Map<string, TEntity>();
            for (const entity of entities) {
                const key = this.createKeyText(entity);
                if (this._entityMap.has(key)) {
                    updatedEntites.set(key, entity);
                }
                else {
                    addedEntites.set(key, entity);
                }
            }

            // Updated
            for (const [keyText, updatedEntity] of updatedEntites) {
                const index = this._entityMap.get(keyText);
                const existingEntity = this._entities[index];
                const primary = this._schema.primaryParameter as keyof TEntity;
                if (primary) {
                    updatedEntity[primary] = existingEntity[primary];
                }
                this._entities[index] = updatedEntity;
            }
            // Added
            for (const [keyText, addedEntity] of addedEntites) {
                const primary = this._schema.primaryParameter as keyof TEntity;
                if (primary) {
                    addedEntity[primary] = this._entities.length + 1 as any;
                }

                const keyText = this.createKeyText(addedEntity);
                const index = this._entities.push(addedEntity) - 1;
                this._entityMap.set(keyText, index);
            }

            return {
                added: [...addedEntites.values()],
                updated: [...updatedEntites.values()],
            };
        }

        protected createKeyText(key: Pick<TEntity, TKey>): string {
            return this._schema.keyParameters
                .map(x => key[x].toString())
                .join(',');
        }

        protected createKey(parameters: unknown[]): Pick<TEntity, TKey> {
            const key = {} as Pick<TEntity, TKey>;
            for (const param of this._schema.keyParameters as string[]) {
                const index = this._parameterMap.get(param);
                key[param] = parameters[index];
            }
            return key;
        }
    }
}
