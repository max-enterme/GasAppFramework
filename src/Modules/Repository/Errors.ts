namespace Repository {
    export class RepositoryError extends Error {
        constructor(public code: Repository.Ports.ErrorCode, message: string) {
            super(message)
            this.name = 'RepositoryError'
        }
    }
}
