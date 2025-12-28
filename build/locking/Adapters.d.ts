/**
 * Locking Module - GAS Adapters
 */
import type * as LockingTypes from './Types';
import type { Clock, Logger as ILogger } from '../shared/index';
/**
 * PropertiesService adapter for lock storage
 */
export declare class PropertiesStore implements LockingTypes.Ports.Store {
    private prefix;
    constructor(prefix?: string);
    get(key: string): string | null;
    set(key: string, value: string): void;
    del(key: string): void;
}
/**
 * System clock implementation
 */
export declare class SystemClock implements Clock {
    now(): Date;
}
/**
 * GAS Logger implementation
 */
export declare class GasLogger implements ILogger {
    info(msg: string): void;
    error(msg: string): void;
}
//# sourceMappingURL=Adapters.d.ts.map