/**
 * Common shared types used across multiple modules
 * Organized in namespaces for Google Apps Script compatibility
 */
declare namespace Shared {
    namespace Types {
        /** Common logger interface used by all modules */
        interface Logger {
            info(msg: string): void;
            error(msg: string, err?: unknown): void;
        }

        /** Clock interface for time operations */
        interface Clock {
            now(): Date;
        }

        /** Random number and UUID generation */
        interface Random {
            uuid(): string;
            next(): number;
        }

        /** Brand type helper for creating nominal types */
        type Brand<K, B> = K & { readonly __brand?: B };
    }
}