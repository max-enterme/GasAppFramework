namespace RestFramework {
    /**
     * Centralized error handling for API RestFramework
     */
    export class ErrorHandler {
        constructor(
            private logger: Shared.Types.Logger = new RestFramework.Logger('[ErrorHandler]')
        ) {}

        /**
         * Handles errors and converts them to API responses
         */
        handle(error: unknown): RestFramework.Types.ApiResponse<never> {
            this.logger.error('Handling error', error);

            // Handle known error types
            if (error instanceof Error) {
                return this.handleKnownError(error);
            }

            // Handle unknown errors
            return RestFramework.ApiResponseFormatter.error(
                'InternalError',
                'An unexpected error occurred',
                error
            );
        }

        /**
         * Handles known Error instances
         */
        private handleKnownError(error: Error): RestFramework.Types.ApiResponse<never> {
            // Map common error patterns to error codes
            const errorCode = this.mapErrorToCode(error);
            return RestFramework.ApiResponseFormatter.error(errorCode, error.message, error);
        }

        /**
         * Maps error types/messages to framework error codes
         */
        private mapErrorToCode(error: Error): RestFramework.Types.ErrorCode {
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