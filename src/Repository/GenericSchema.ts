namespace Repository {
    export class GenericSchema<TEntity extends object, TKey extends keyof TEntity> implements Schema<TEntity, TKey> {
        private readonly _factory: () => TEntity;
        private readonly _parameters: (keyof TEntity)[];
        private readonly _keyParameters: TKey[];

        public get parameters(): (keyof TEntity)[] { return this._parameters; }
        public get keyParameters(): TKey[] { return this._keyParameters; }

        private _primaryParameter: keyof TEntity;
        public get primaryParameter(): keyof TEntity { return this._primaryParameter; }
        public set primaryParameter(value: keyof TEntity) { this._primaryParameter = value; }

        public constructor(factory: { new(): TEntity }, keyParameters: TKey[]) {
            this._factory = () => new factory();
            this._parameters = Object.keys(this._factory() as object) as (keyof TEntity)[];
            this._keyParameters = keyParameters;
        }

        public instantiateEntity(): TEntity {
            return this._factory();
        }

        public instantiateEntityByParameter(parameter: Required<TEntity>): TEntity {
            const entity = this.instantiateEntity();
            for (const param of this.parameters) {
                entity[param] = parameter[param];
            }
            return entity;
        }
    }
}
