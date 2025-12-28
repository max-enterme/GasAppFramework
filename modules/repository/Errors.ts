/**
 * Repository Module - Error Classes
 */

import type { ErrorCode } from './Types';

export class RepositoryError extends Error {
    constructor(public code: ErrorCode, message: string) {
        super(message);
        this.name = 'RepositoryError';
    }
}
