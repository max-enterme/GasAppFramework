/**
 * RestFramework - Logger Implementation
 */

import type { Logger as ILogger } from '../shared/index';

/**
 * Basic logger implementation for API RestFramework
 * Adapts to existing shared Logger interface
 */
export class Logger implements ILogger {
    constructor(private prefix: string = '[API]') {}

    info(msg: string): void {
        console.log(`${this.prefix} ${new Date().toISOString()} INFO: ${msg}`);
    }

    error(msg: string, err?: unknown): void {
        const errorMsg = err ? ` | Error: ${err}` : '';
        console.error(`${this.prefix} ${new Date().toISOString()} ERROR: ${msg}${errorMsg}`);
    }

    /**
     * Creates a logger with custom prefix
     */
    static create(prefix: string = '[API]'): Logger {
        return new Logger(prefix);
    }
}
