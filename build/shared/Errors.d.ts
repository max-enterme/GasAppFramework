/**
 * Shared Errors - ES Modules版
 */
export declare class DomainError extends Error {
    code: string;
    constructor(code: string, message: string);
    static invalidArg(msg: string): DomainError;
    static notFound(msg: string): DomainError;
    static state(msg: string): DomainError;
}
//# sourceMappingURL=Errors.d.ts.map