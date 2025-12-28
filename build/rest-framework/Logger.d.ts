/**
 * RestFramework - Logger Implementation
 */
import type { Logger as ILogger } from '../shared/index';
/**
 * Basic logger implementation for API RestFramework
 * Adapts to existing shared Logger interface
 */
export declare class Logger implements ILogger {
    private prefix;
    constructor(prefix?: string);
    info(msg: string): void;
    error(msg: string, err?: unknown): void;
    /**
     * Creates a logger with custom prefix
     */
    static create(prefix?: string): Logger;
}
//# sourceMappingURL=Logger.d.ts.map