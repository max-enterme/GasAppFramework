namespace GasDI {
    export class GenericFactory<T> implements GasDI.Ports.Factory<T> {
        private readonly ctor: new () => T
        constructor(ctor: new () => T) { this.ctor = ctor }
        instantiate(): T { return new this.ctor() }
    }
}
