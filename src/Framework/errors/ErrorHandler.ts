namespace Framework {
    /**
     * Centralized error handling for API Framework
     */
    export class ErrorHandler {
        constructor(
            private logger: Shared.Types.Logger = new Framework.Logger('[ErrorHandler]')
        ) {}

        /**
         * Handles errors and converts them to API responses
         */
        handle(error: unknown): Framework.Types.ApiResponse<never> {
            this.logger.error('Handling error', error);

            // Handle known error types
            if (error instanceof Error) {
                return this.handleKnownError(error);
            }

            // Handle unknown errors
            return Framework.ApiResponseFormatter.error(
                'InternalError',
                'An unexpected error occurred',
                error
            );
        }

        /**
         * Handles known Error instances
         */
        private handleKnownError(error: Error): Framework.Types.ApiResponse<never> {
            // Map common error patterns to error codes
            const errorCode = this.mapErrorToCode(error);
            return Framework.ApiResponseFormatter.error(errorCode, error.message, error);
        }

        /**
         * Maps error types/messages to framework error codes
         */
        private mapErrorToCode(error: Error): Framework.Types.ErrorCode {
            const message = error.message.toLowerCase();
            
            if (message.includes('validation') || message.includes('invalid')) {
                return 'ValidationError';
            }
            if (message.includes('unauthorized') || message.includes('authentication')) {
                return 'AuthenticationError';
            }
            if (message.includes('forbidden') || message.includes('authorization')) {
                return 'AuthorizationError';
            }
            if (message.includes('not found')) {
                return 'NotFound';
            }
            if (message.includes('method not allowed')) {
                return 'MethodNotAllowed';
            }
            if (message.includes('bad request')) {
                return 'BadRequest';
            }

            return 'InternalError';
        }

        /**
         * Creates an ErrorHandler with optional logger
         */
        static create(logger?: Shared.Types.Logger): ErrorHandler {
            return new ErrorHandler(logger);
        }
    }
}