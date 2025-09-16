declare namespace Shared {
    namespace Ports {
        export interface Logger { info(msg: string): void; error(msg: string, err?: unknown): void }
        export interface Clock { now(): Date }
        export interface Random { uuid(): string; next(): number; }
    }
}
