/**
 * Shared Errors - ES Modules版
 */

export class DomainError extends Error {
    constructor(public code: string, message: string) {
        super(message);
        this.name = 'DomainError';
    }

    static invalidArg(msg: string): DomainError {
        return new DomainError('InvalidArg', msg);
    }

    static notFound(msg: string): DomainError {
        return new DomainError('NotFound', msg);
    }

    static state(msg: string): DomainError {
        return new DomainError('State', msg);
    }
}
