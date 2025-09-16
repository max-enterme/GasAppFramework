/// <reference path="../../Shared/ErrorTypes.d.ts" />

namespace Repository {
    export class RepositoryError extends Error {
        constructor(public code: Repository.Types.ErrorCode, message: string) {
            super(message)
            this.name = 'RepositoryError'
        }
    }
}
