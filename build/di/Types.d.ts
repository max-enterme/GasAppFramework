/**
 * GasDI Types - ES Modules版
 * Dependency Injection Container の型定義
 */
export type Brand<K, B> = K & {
    readonly __brand?: B;
};
export type Token<T = unknown> = Brand<string, T>;
export type Lifetime = 'singleton' | 'scoped' | 'transient';
export interface Factory<T = any> {
    instantiate(): T;
}
export interface Provider<T = any> {
    (): T;
}
export interface Logger {
    info(msg: string): void;
    error(msg: string): void;
}
//# sourceMappingURL=Types.d.ts.map