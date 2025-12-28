/**
 * GasDI Container - ES Modules版
 * Dependency Injection Container with support for multiple lifetimes
 */
import type { Token, Lifetime } from './Types';
/**
 * Dependency injection container with support for multiple lifetimes
 */
export declare class Container {
    static readonly Root: Container;
    static readonly DEFAULT_SCOPE = "default";
    private registers;
    private singletons;
    private scopedByName;
    private parent?;
    private _scopeName?;
    constructor(parent?: Container);
    createScope(name?: string): Container;
    registerValue<T>(token: Token<T>, value: T): this;
    registerFactory<T>(token: Token<T>, make: () => T, lifetime?: Lifetime): this;
    registerClass<T>(token: Token<T>, ctor: new () => T, lifetime?: Lifetime): this;
    resolve<T>(token: Token<T>, opts?: {
        optional?: boolean;
    }): T;
    private tryResolve;
    private instantiate;
    /**
     * Disposes the scoped container and cleans up scoped instances
     * Should be called after Context.run to prevent resource leaks
     * Only cleans up resources for scoped containers (those with a scope name)
     *
     * Note: Scoped containers typically don't have their own registrations,
     * they inherit from parent. This method focuses on cleaning up instances.
     */
    dispose(): void;
}
//# sourceMappingURL=Container.d.ts.map