namespace Repository {
    export class SpreadsheetRepository<TEntity extends object, TKey extends keyof TEntity> implements Repository<TEntity, TKey> {
        protected readonly _schema: Schema<TEntity, TKey>;
        protected readonly _sheet: GoogleAppsScript.Spreadsheet.Sheet;

        protected _header: Map<string, number>;

        protected readonly _entities: TEntity[] = [];
        protected readonly _entityMap: Map<string, number> = new Map();

        public get entities(): TEntity[] {
            this.validateAccess();
            return this._entities.slice();
        }

        public constructor(
            schema: SpreadsheetRepository<TEntity, TKey>['_schema'],
            sheet: SpreadsheetRepository<TEntity, TKey>['_sheet']
        ) {
            this._schema = schema;
            this._sheet = sheet;
        }

        private loaded = false;

        public load(): void {
            if (this.loaded) {
                return;
            }

            const sheetData = this._sheet.getDataRange().getValues();
            this.initializeHeader(sheetData);
            this.initializeEntities(sheetData);
            this.loaded = true;
        }

        private validateAccess() {
            if (!this.loaded) {
                throw new Error("Error: Repository not loaded. Please call the `load` method before accessing the repository.");
            }
        }

        private initializeHeader(sheetData: unknown[][]): void {
            const header = sheetData[0] as string[];

            this._header = new Map();
            for (let i = 0; i < header.length; i++) {
                this._header.set(header[i], i);
            }
        }

        private initializeEntities(sheetData: unknown[][]): void {
            this._entities.length = 0;
            this._entityMap.clear();
            for (let i = 1; i < sheetData.length; i++) {
                const entity = this._schema.instantiateEntity();
                for (const [param, index] of this._header) {
                    entity[param] = sheetData[i][index];
                }
                const key = this.createKey(sheetData[i]);
                const keyText = this.createKeyText(key);
                const entityIndex = this._entities.push(entity) - 1;
                this._entityMap.set(keyText, entityIndex);
            }
        }

        protected createKey(parameters: unknown[]): Pick<TEntity, TKey> {
            const key = {} as Pick<TEntity, TKey>;
            for (const param of this._schema.keyParameters as string[]) {
                const index = this._header.get(param);
                key[param] = parameters[index];
            }
            return key;
        }

        protected createKeyText(key: Pick<TEntity, TKey>): string {
            return this._schema.keyParameters
                .map(x => key[x].toString())
                .join(',');
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

            let minRow = -1;
            let maxRow = -1;
            // Updated
            for (const [keyText, updatedEntity] of updatedEntites) {
                const index = this._entityMap.get(keyText);
                const existingEntity = this._entities[index];
                const primary = this._schema.primaryParameter as keyof TEntity;
                if (primary) {
                    updatedEntity[primary] = existingEntity[primary];
                }

                if ('createdAt' in updatedEntity || 'createdAt' in existingEntity) {
                    updatedEntity['createdAt'] = existingEntity['createdAt'];
                }
                else if (this._header.has('createdAt')) {
                    updatedEntity['createdAt'] = new Date();
                }

                if ('updatedAt' in updatedEntity || this._header.has('updatedAt')) {
                    updatedEntity['updatedAt'] = new Date();
                }

                this._entities[index] = updatedEntity;

                minRow = minRow === -1 ? index : Math.min(index, minRow);
                maxRow = maxRow === -1 ? index : Math.max(index, maxRow);
            }
            // Added
            for (const [keyText, addedEntity] of addedEntites) {
                const primary = this._schema.primaryParameter as keyof TEntity;
                if (primary) {
                    addedEntity[primary] = this._entities.length + 1 as any;
                }
                if ('createdAt' in addedEntity || this._header.has('createdAt')) {
                    addedEntity['createdAt'] = new Date();
                }
                if ('updatedAt' in addedEntity || this._header.has('updatedAt')) {
                    addedEntity['updatedAt'] = new Date();
                }

                const keyText = this.createKeyText(addedEntity);
                const index = this._entities.push(addedEntity) - 1;
                this._entityMap.set(keyText, index);

                minRow = minRow === -1 ? index : Math.min(index, minRow);
                maxRow = maxRow === -1 ? index : Math.max(index, maxRow);
            }

            if (minRow >= 0 && maxRow >= 0) {
                const rawEntities: unknown[][] = [];
                for (let i = minRow; i <= maxRow; i++) {
                    rawEntities.push(this.toRawEntity(this._entities[i]));
                }
                this._sheet.getRange(minRow + 2, 1, maxRow - minRow + 1, rawEntities[0].length).setValues(rawEntities);
            }

            return {
                added: [...addedEntites.values()],
                updated: [...updatedEntites.values()],
            };
        }

        protected toRawEntity(entity: TEntity): unknown[] {
            const rawEntity: unknown[] = new Array(this._header.size);
            for (const [param, index] of this._header) {
                if (param in entity) {
                    const value = entity[param];
                    rawEntity[index] = typeof value === 'string' ? `'${value}` : value;
                }
                else {
                    rawEntity[index] = null;
                }
            }
            return rawEntity;
        }
    }
}
