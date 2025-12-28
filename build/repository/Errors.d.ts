/**
 * Repository Module - Error Classes
 */
import type { ErrorCode } from './Types';
export declare class RepositoryError extends Error {
    code: ErrorCode;
    constructor(code: ErrorCode, message: string);
}
//# sourceMappingURL=Errors.d.ts.map