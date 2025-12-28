/**
 * Locking Module - Engine Implementation
 */
import type * as LockingTypes from './Types';
import type { Clock, Random, Logger } from '../shared/index';
export type Deps = {
    store: LockingTypes.Ports.Store;
    clock: Clock;
    rand?: Random;
    logger?: Logger;
    namespace?: string;
};
export declare function create(deps: Deps): LockingTypes.LockEngine;
//# sourceMappingURL=Engine.d.ts.map