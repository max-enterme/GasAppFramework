/**
 * RestFramework - API Response Formatter
 */
import type * as Types from './Types';
/**
 * Standard API response formatter
 * Provides consistent response structure across all API endpoints
 */
export declare class ApiResponseFormatter {
    /**
     * Creates a successful response
     */
    static success<T>(data: T): Types.ApiResponse<T>;
    /**
     * Creates an error response
     */
    static error(code: Types.ErrorCode, message: string, details?: any): Types.ApiResponse<never>;
    /**
     * Creates a response from raw data, handling errors automatically
     */
    static from<T>(dataOrError: T | Error, errorCode?: Types.ErrorCode): Types.ApiResponse<T>;
}
//# sourceMappingURL=ApiResponseFormatter.d.ts.map