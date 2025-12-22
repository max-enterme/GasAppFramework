namespace RestFramework {
    /**
     * Standard API response formatter
     * Provides consistent response structure across all API endpoints
     */
    export class ApiResponseFormatter {
        /**
         * Creates a successful response
         */
        static success<T>(data: T): RestFramework.Types.ApiResponse<T> {
            return {
                success: true,
                data,
                timestamp: new Date().toISOString()
            };
        }

        /**
         * Creates an error response
         */
        static error(
            code: RestFramework.Types.ErrorCode,
            message: string,
            details?: any
        ): RestFramework.Types.ApiResponse<never> {
            return {
                success: false,
                error: {
                    code,
                    message,
                    details
                },
                timestamp: new Date().toISOString()
            };
        }

        /**
         * Creates a response from raw data, handling errors automatically
         */
        static from<T>(
            dataOrError: T | Error,
            errorCode: RestFramework.Types.ErrorCode = 'InternalError'
        ): RestFramework.Types.ApiResponse<T> {
            if (dataOrError instanceof Error) {
                return this.error(errorCode, dataOrError.message, dataOrError);
            }
            return this.success(dataOrError);
        }
    }
}