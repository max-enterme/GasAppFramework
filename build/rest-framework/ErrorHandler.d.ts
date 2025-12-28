/**
 * RestFramework - Error Handler
 */
import type * as Types from './Types';
import type { Logger as ILogger } from '../shared/index';
/**
 * Centralized error handling for API RestFramework
 * Provides comprehensive error logging, monitoring, and standardized error responses
 */
export declare class ErrorHandler {
    private logger;
    private errorCount;
    constructor(logger?: ILogger);
    /**
     * Handles errors and converts them to API responses
     * Logs comprehensive error information for monitoring and debugging
     */
    handle(error: unknown, context?: {
        request?: any;
        timestamp?: string;
    }): Types.ApiResponse<never>;
    /**
     * Handles known Error instances
     */
    private handleKnownError;
    /**
     * Maps error types/messages to framework error codes
     */
    private mapErrorToCode;
    /**
     * Logs comprehensive error information for monitoring and debugging
     */
    private logError;
    /**
     * Sanitizes request data for logging (removes sensitive information)
     */
    private sanitizeRequest;
    /**
     * Tracks error frequency for monitoring high-frequency errors
     * This helps identify recurring issues that need attention
     */
    private trackErrorFrequency;
    /**
     * Gets error statistics for monitoring
     * Useful for understanding error patterns in production
     */
    getErrorStatistics(): {
        errorKey: string;
        count: number;
    }[];
    /**
     * Resets error statistics
     * Useful for clearing counters after a deployment or time period
     */
    resetErrorStatistics(): void;
    /**
     * Creates an ErrorHandler with optional logger
     */
    static create(logger?: ILogger): ErrorHandler;
}
//# sourceMappingURL=ErrorHandler.d.ts.map