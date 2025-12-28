/**
 * Common shared types used across multiple modules
 */
/** Common logger interface used by all modules */
export interface Logger {
    info(msg: string): void;
    error(msg: string, err?: unknown): void;
}
/** Clock interface for time operations */
export interface Clock {
    now(): Date;
}
/** Random number and UUID generation */
export interface Random {
    uuid(): string;
    next(): number;
}
/** Brand type helper for creating nominal types */
export type Brand<K, B> = K & {
    readonly __brand?: B;
};
//# sourceMappingURL=CommonTypes.d.ts.map