namespace GasDI {
    export interface Factory<T = {}> {
        instantiate(): T;
    }

    type FactoryConstructor<T = {}> = new () => Factory<T>;

    export type FactoryProvider<TFactory extends Factory = Factory> = (...args: any[]) => TFactory;

    type BindingInstance<T = {}> = {
        type: 'instance',
        value: T,
    };
    type BindingFactory<T = {}> = {
        type: 'factory',
        value: Factory<T>,
        singleton: boolean,
    };
    type BindingFactoryConstructor<T = {}> = {

        type: 'factoryConstructor',
        value: FactoryConstructor<T>,
        singleton: boolean,
    };

    type BindingInfo<T = {}> =
        BindingInstance<T> | BindingFactory<T> | BindingFactoryConstructor<T>;

    export class Container {
        private static readonly _globalBindings = new Map<string, BindingInfo>();
        private static readonly _scopedBindings = new Map<string, Map<string, BindingInfo>>();
        private static readonly _scopedSingletonInstances = new Map<string, Map<string, any>>();

        // Global ================================================================================================================================================================================================================
        public static bind<T>(key: string, instance: T) {
            this._globalBindings.set(key, { type: 'instance', value: instance });
            return this;
        }

        public static bindFactory<T>(key: string, factory: Factory<T>, options: Omit<BindingFactory, 'type' | 'value'> = { singleton: true }) {
            this._globalBindings.set(key, { type: 'factory', value: factory, ...options });
            return this;
        }

        public static bindFactoryConstructor<T>(key: string, factoryConstructor: FactoryConstructor<T>, options: Omit<BindingFactoryConstructor, 'type' | 'value'> = { singleton: true }) {
            this._globalBindings.set(key, { type: 'factoryConstructor', value: factoryConstructor, ...options });
            return this;
        }

        public static loadBindings(bindings: [key: string, instance: any][]) {
            bindings.forEach(([key, instance]) => this.bind(key, instance));
            return this;
        }

        public static loadFactories(factories: [key: string, factory: Factory, options?: Omit<BindingFactory, 'type' | 'value'>][]) {
            factories.forEach(([key, factory, options]) => this.bindFactory(key, factory, options ?? { singleton: true }));
            return this;
        }

        public static loadFactoryConstructors(constructors: [key: string, constructor: FactoryConstructor, options?: Omit<BindingFactoryConstructor, 'type' | 'value'>][]) {
            constructors.forEach(([key, constructor, options]) => this.bindFactoryConstructor(key, constructor, options ?? { singleton: true }));
            return this;
        }

        // Scoped ================================================================================================================================================================================================================
        public static bindScoped<T>(scope: string, key: string, instance: T) {
            this.getOrCreateScope(scope).set(key, { type: 'instance', value: instance });
            return this;
        }

        public static bindScopedFactory<T>(scope: string, key: string, factory: Factory<T>, options: Omit<BindingFactory<T>, 'type' | 'value'> = { singleton: true }) {
            this.getOrCreateScope(scope).set(key, { type: 'factory', value: factory, ...options });
            return this;
        }

        public static bindScopedFactoryConstructor<T>(scope: string, key: string, factoryConstructor: FactoryConstructor<T>, options: Omit<BindingFactoryConstructor<T>, 'type' | 'value'> = { singleton: true }) {
            this.getOrCreateScope(scope).set(key, { type: 'factoryConstructor', value: factoryConstructor, singleton: true });
            return this;
        }

        public static loadScopedBindings(scope, bindings: [key: string, instance: any][]) {
            bindings.forEach(([key, instance]) => this.bindScoped(scope, key, instance));
            return this;
        }

        public static loadScopedFactories(scope, factories: [key: string, factory: Factory, options?: Omit<BindingFactory, 'type' | 'value'>][]) {
            factories.forEach(([key, factory, options]) => this.bindScopedFactory(scope, key, factory, options ?? { singleton: true }));
            return this;
        }

        public static loadScopedFactoryConstructors(scope, factoryConstructors: [key: string, FactoryConstructor: FactoryConstructor, options?: Omit<BindingFactoryConstructor, 'type' | 'value'>][]) {
            factoryConstructors.forEach(([key, constructor, option]) => this.bindScopedFactoryConstructor(scope, key, constructor, option ?? { singleton: true }));
            return this;
        }

        private static getOrCreateScope(scope: string): Map<string, BindingInfo> {
            if (!this._scopedBindings.has(scope)) {
                this._scopedBindings.set(scope, new Map());
            }
            return this._scopedBindings.get(scope);
        }

        // ================================================================================================================================================================================================================
        public static readonly DEFAULT_SCOPE = 'default';

        public static resolve<T>(scope: string, key: string, optional: boolean = false): T {
            const scopedBindings = this._scopedBindings.get(scope);
            if (scopedBindings && scopedBindings.has(key)) {
                return this.resolveBinding(scopedBindings.get(key), scope, key) as T;
            }

            const binding = this._globalBindings.get(key);
            if (!binding) {
                throw new Error(`No binding found for key: ${key}`);
            }
            return this.resolveBinding(binding, GasDI.Container.DEFAULT_SCOPE, key) as T;
        }

        private static resolveBinding<T>(binding: BindingInfo<T>, scope: string, key: string): T {
            if (binding.type === 'instance') {
                return binding.value;
            }
            if (binding.type === 'factory') {
                if (binding.singleton) {
                    const singletonContainer = this.getOrCreateSingletonContainer(scope);
                    if (!singletonContainer.has(key)) {
                        singletonContainer.set(key, binding.value.instantiate());
                    }
                    return singletonContainer.get(key);
                }
                else {
                    return binding.value.instantiate();
                }
            }
            if (binding.type === 'factoryConstructor') {
                if (binding.singleton) {
                    const singletonContainer = this.getOrCreateSingletonContainer(scope);
                    if (!singletonContainer.has(key)) {
                        singletonContainer.set(key, (new binding.value()).instantiate());
                    }
                    return singletonContainer.get(key);
                }
                else {
                    return (new binding.value()).instantiate();
                }
            }
        }

        private static getOrCreateSingletonContainer(scope: string): Map<string, any> {
            if (!this._scopedSingletonInstances.has(scope)) {
                this._scopedSingletonInstances.set(scope, new Map());
            }
            return this._scopedSingletonInstances.get(scope);
        }
    }
}
