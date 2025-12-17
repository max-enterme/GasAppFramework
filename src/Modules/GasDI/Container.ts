/**
 * GasDI Container - Dependency Injection Container
 */

namespace GasDI {
    type Lifetime = GasDI.Ports.Lifetime
    type Token<T = any> = GasDI.Ports.Token<T>

    type Reg<T = any> =
        | { kind: 'value'; token: Token<T>; value: T }
        | { kind: 'factory'; token: Token<T>; lifetime: Lifetime; make: () => T }

    /**
     * Dependency injection container with support for multiple lifetimes
     */
    export class Container {
        public static readonly Root = new Container();

        static readonly DEFAULT_SCOPE = 'default';

        private regs = new Map<string, Reg<any>>();
        private singletons = new Map<string, any>();
        private scopedByName = new Map<string, Map<string, any>>(); // scopeName -> (token -> instance)
        private parent?: Container;
        private _scopeName?: string;

        constructor(parent?: Container) { this.parent = parent; }

        createScope(name?: string): Container {
            const child: Container = new Container(this);
            (child as any)._scopeName = name && name.trim().length ? name : `request-${Date.now()}`;
            return child;
        }

        registerValue<T>(token: Token<T>, value: T): this {
            this.regs.set(token, { kind: 'value', token, value });
            return this;
        }

        registerFactory<T>(token: Token<T>, make: () => T, lifetime: Lifetime = 'transient'): this {
            this.regs.set(token, { kind: 'factory', token, lifetime, make });
            return this;
        }

        registerClass<T>(token: Token<T>, ctor: new () => T, lifetime: Lifetime = 'transient'): this {
            return this.registerFactory(token, () => new ctor(), lifetime);
        }

        resolve<T>(token: Token<T>, opts?: { optional?: boolean }): T {
            const optional = !!(opts && opts.optional);
            const scopeName = this._scopeName || Container.DEFAULT_SCOPE;
            const got = this.tryResolve<T>(token, scopeName);
            if (got === undefined && !optional) throw new Error(`DI token not found: ${token}`);
            return got as T;
        }

        private tryResolve<T>(token: Token<T>, scopeName: string): T | undefined {
            const reg = this.regs.get(token);
            if (reg) return this.instantiate(reg, scopeName);

            if (this.parent) {
                const parentVal = this.parent.tryResolve<T>(token, scopeName);
                if (parentVal !== undefined) return parentVal;
            }
            return undefined;
        }

        private instantiate<T>(reg: Reg<T>, scopeName: string): T {
            if (reg.kind === 'value') return reg.value;

            if (reg.lifetime === 'singleton') {
                if (this.singletons.has(reg.token)) return this.singletons.get(reg.token);
                const v = reg.make();
                this.singletons.set(reg.token, v);
                return v;
            }
            if (reg.lifetime === 'scoped') {
                const name = scopeName || Container.DEFAULT_SCOPE;
                let bag = this.scopedByName.get(name);
                if (!bag) { bag = new Map(); this.scopedByName.set(name, bag); }
                if (bag.has(reg.token)) return bag.get(reg.token);
                const v = reg.make();
                bag.set(reg.token, v);
                return v;
            }
            return reg.make();
        }

        /**
         * Disposes the scoped container and cleans up scoped instances
         * Should be called after GasDI.Context.run to prevent resource leaks
         */
        dispose(): void {
            if (this._scopeName) {
                // Clear scoped instances for this scope from parent container
                if (this.parent) {
                    this.parent.scopedByName.delete(this._scopeName);
                }
                // Clear local scoped instances
                this.scopedByName.clear();
            }
            // Clear registrations
            this.regs.clear();
        }
    }
}
