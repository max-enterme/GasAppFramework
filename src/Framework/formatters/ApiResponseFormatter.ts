namespace Framework {
    /**
     * Standard API response formatter
     * Provides consistent response structure across all API endpoints
     */
    export class ApiResponseFormatter {
        /**
         * Creates a successful response
         */
        static success<T>(data: T): Framework.Types.ApiResponse<T> {
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
            code: Framework.Types.ErrorCode,
            message: string,
            details?: any
        ): Framework.Types.ApiResponse<never> {
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
            errorCode: Framework.Types.ErrorCode = 'InternalError'
        ): Framework.Types.ApiResponse<T> {
            if (dataOrError instanceof Error) {
                return this.error(errorCode, dataOrError.message, dataOrError);
            }
            return this.success(dataOrError);
        }
    }
}