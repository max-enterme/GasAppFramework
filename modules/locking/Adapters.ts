/**
 * Locking Module - GAS Adapters
 */

/// <reference path="../../types/gas-globals.d.ts" />

import type * as LockingTypes from './Types';
import type { Clock, Logger as ILogger } from '../shared/index';

/**
 * PropertiesService adapter for lock storage
 */
export class PropertiesStore implements LockingTypes.Ports.Store {
    constructor(private prefix: string = 'lock:') {}

    get(key: string): string | null {
        const p = PropertiesService.getScriptProperties();
        return p.getProperty(this.prefix + key) ?? null;
    }

    set(key: string, value: string): void {
        PropertiesService.getScriptProperties().setProperty(this.prefix + key, value);
    }

    del(key: string): void {
        PropertiesService.getScriptProperties().deleteProperty(this.prefix + key);
    }
}

/**
 * System clock implementation
 */
export class SystemClock implements Clock {
    now(): Date {
        return new Date();
    }
}

/**
 * GAS Logger implementation
 */
export class GasLogger implements ILogger {
    info(msg: string): void {
        Logger.log(msg);
    }

    error(msg: string): void {
        Logger.log(msg);
    }
}
