/**
 * RestFramework - Error Handler
 */

import type * as Types from './Types';
import type { Logger as ILogger } from '../shared/index';
import { Logger } from './Logger';
import { ApiResponseFormatter } from './ApiResponseFormatter';

/**
 * Centralized error handling for API RestFramework
 * Provides comprehensive error logging, monitoring, and standardized error responses
 */
export class ErrorHandler {
    private errorCount: Map<string, number> = new Map();

    constructor(private logger: ILogger = new Logger('[ErrorHandler]')) {}

    /**
     * Handles errors and converts them to API responses
     * Logs comprehensive error information for monitoring and debugging
     */
    handle(
        error: unknown,
        context?: { request?: any; timestamp?: string }
    ): Types.ApiResponse<never> {
        // Log error with full context
        this.logError(error, context);

        // Track error frequency for monitoring
        this.trackErrorFrequency(error);

        // Handle known error types
        if (error instanceof Error) {
            return this.handleKnownError(error);
        }

        // Handle unknown errors
        return ApiResponseFormatter.error('InternalError', 'An unexpected error occurred', error);
    }

    /**
     * Handles known Error instances
     */
    private handleKnownError(error: Error): Types.ApiResponse<never> {
        // Map common error patterns to error codes
        const errorCode = this.mapErrorToCode(error);
        return ApiResponseFormatter.error(errorCode, error.message, error);
    }

    /**
     * Maps error types/messages to framework error codes
     */
    private mapErrorToCode(error: Error): Types.ErrorCode {
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
     * Logs comprehensive error information for monitoring and debugging
     */
    private logError(error: unknown, context?: { request?: any; timestamp?: string }): void {
        const errorCode = error instanceof Error ? this.mapErrorToCode(error) : 'InternalError';
        const timestamp = context?.timestamp || new Date().toISOString();

        const errorInfo = {
            code: errorCode,
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: timestamp,
            stack: error instanceof Error ? error.stack : undefined,
            request: context?.request ? this.sanitizeRequest(context.request) : undefined,
        };

        this.logger.error(`Error occurred: ${errorCode}`, errorInfo);

        // Log to console for GAS execution transcript visibility
        console.error(`[${timestamp}] ErrorHandler: ${errorCode} - ${errorInfo.message}`);
        if (error instanceof Error && error.stack) {
            console.error(`Stack trace: ${error.stack}`);
        }
    }

    /**
     * Sanitizes request data for logging (removes sensitive information)
     */
    private sanitizeRequest(request: any): any {
        if (!request) return undefined;

        const sanitized: any = {
            method: request.method,
            path: request.path,
        };

        // Remove sensitive headers like authorization tokens
        if (request.headers) {
            sanitized.headers = { ...request.headers };
            if (sanitized.headers.authorization) {
                sanitized.headers.authorization = '[REDACTED]';
            }
            if (sanitized.headers.token) {
                sanitized.headers.token = '[REDACTED]';
            }
        }

        return sanitized;
    }

    /**
     * Tracks error frequency for monitoring high-frequency errors
     * This helps identify recurring issues that need attention
     */
    private trackErrorFrequency(error: unknown): void {
        const errorKey =
            error instanceof Error
                ? `${this.mapErrorToCode(error)}:${error.message}`
                : 'UnknownError';

        const currentCount = this.errorCount.get(errorKey) || 0;
        const newCount = currentCount + 1;
        this.errorCount.set(errorKey, newCount);

        // Log warning for high-frequency errors (threshold: 5 occurrences)
        if (newCount === 5) {
            this.logger.error(
                `High-frequency error detected: ${errorKey} (${newCount} occurrences)`,
                { errorKey, count: newCount }
            );
            console.warn(
                `[MONITORING] High-frequency error: ${errorKey} occurred ${newCount} times`
            );
        } else if (newCount > 5 && newCount % 10 === 0) {
            // Log every 10th occurrence after threshold
            this.logger.error(
                `Continuing high-frequency error: ${errorKey} (${newCount} occurrences)`,
                { errorKey, count: newCount }
            );
        }
    }

    /**
     * Gets error statistics for monitoring
     * Useful for understanding error patterns in production
     */
    getErrorStatistics(): { errorKey: string; count: number }[] {
        const stats: { errorKey: string; count: number }[] = [];
        this.errorCount.forEach((count, errorKey) => {
            stats.push({ errorKey, count });
        });
        return stats.sort((a, b) => b.count - a.count); // Sort by frequency descending
    }

    /**
     * Resets error statistics
     * Useful for clearing counters after a deployment or time period
     */
    resetErrorStatistics(): void {
        this.errorCount.clear();
        this.logger.info('Error statistics reset');
    }

    /**
     * Creates an ErrorHandler with optional logger
     */
    static create(logger?: ILogger): ErrorHandler {
        return new ErrorHandler(logger);
    }
}
