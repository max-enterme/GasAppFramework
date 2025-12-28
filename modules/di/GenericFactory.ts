/**
 * Generic Factory - Simple implementation of Factory interface
 */

import type { Factory } from './Types';

/**
 * Generic factory that instantiates classes using their constructor
 */
export class GenericFactory<T> implements Factory<T> {
    private readonly ctor: new () => T;

    constructor(ctor: new () => T) {
        this.ctor = ctor;
    }

    instantiate(): T {
        return new this.ctor();
    }
}
