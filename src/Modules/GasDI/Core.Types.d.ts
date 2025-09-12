declare namespace GasDI {
    namespace Ports {
        type Token<T=any> = string
        type Lifetime = 'singleton' | 'scoped' | 'transient'

        interface Factory<T=any> { instantiate(): T }
        interface Provider<T=any> { (): T }

        interface Logger { info(msg: string): void; error(msg: string): void }
    }
}
