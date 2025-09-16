declare namespace GasDI {
    namespace Ports {
        type Brand<K, B> = K & { readonly __brand?: B };
        type Token<T = unknown> = Brand<string, T>;

        type Lifetime = 'singleton' | 'scoped' | 'transient'

        interface Factory<T = any> { instantiate(): T }
        interface Provider<T = any> { (): T }

        interface Logger { info(msg: string): void; error(msg: string): void }
    }
}
