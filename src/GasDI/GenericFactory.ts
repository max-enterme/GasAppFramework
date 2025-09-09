namespace GasDI {
    export class GenericFactory<T> implements GasDI.Factory<T> {
        private readonly _constructor: new () => T;

        public constructor(constructor: new () => T) {
            this._constructor = constructor;
        }

        public instantiate() {
            return new this._constructor();
        }
    }
}
