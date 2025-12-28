/**
 * Generic Factory - Simple implementation of Factory interface
 */
import type { Factory } from './Types';
/**
 * Generic factory that instantiates classes using their constructor
 */
export declare class GenericFactory<T> implements Factory<T> {
    private readonly ctor;
    constructor(ctor: new () => T);
    instantiate(): T;
}
//# sourceMappingURL=GenericFactory.d.ts.map