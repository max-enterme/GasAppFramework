namespace Shared {
    export class DomainError extends Error {
        constructor(public code: string, message: string) {
            super(message);
            this.name = 'DomainError';
        }
        static invalidArg(msg: string) { return new DomainError('InvalidArg', msg); }
        static notFound(msg: string) { return new DomainError('NotFound', msg); }
        static state(msg: string) { return new DomainError('State', msg); }
    }
}
