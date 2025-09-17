/**
 * RestFramework module wrapper for Node.js testing
 * This module provides a testable implementation of the RestFramework namespace
 */

// Define shared types that would normally come from namespaces
export interface Logger {
    info(msg: string): void;
    error(msg: string, err?: unknown): void;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}

export type ErrorCode = 
    | 'ValidationError'
    | 'AuthenticationError' 
    | 'AuthorizationError'
    | 'NotFound'
    | 'MethodNotAllowed'
    | 'InternalError'
    | 'BadRequest';

/**
 * Basic logger implementation for API RestFramework
 */
export class RestFrameworkLogger implements Logger {
    constructor(private prefix: string = '[API]') {}

    info(msg: string): void {
        console.log(`${this.prefix} ${new Date().toISOString()} INFO: ${msg}`);
    }

    error(msg: string, err?: unknown): void {
        const errorMsg = err ? ` | Error: ${err}` : '';
        console.error(`${this.prefix} ${new Date().toISOString()} ERROR: ${msg}${errorMsg}`);
    }

    static create(prefix: string = '[API]'): RestFrameworkLogger {
        return new RestFrameworkLogger(prefix);
    }
}

/**
 * Standard API response formatter
 */
export class ApiResponseFormatter {
    static success<T>(data: T): ApiResponse<T> {
        return {
            success: true,
            data,
            timestamp: new Date().toISOString()
        };
    }

    static error(
        code: ErrorCode,
        message: string,
        details?: any
    ): ApiResponse<never> {
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

    static from<T>(
        dataOrError: T | Error,
        errorCode: ErrorCode = 'InternalError'
    ): ApiResponse<T> {
        if (dataOrError instanceof Error) {
            return this.error(errorCode, dataOrError.message, dataOrError);
        }
        return this.success(dataOrError);
    }
}

/**
 * Centralized error handling for API RestFramework
 */
export class ErrorHandler {
    constructor(
        private logger: Logger = new RestFrameworkLogger('[ErrorHandler]')
    ) {}

    handle(error: unknown): ApiResponse<never> {
        this.logger.error('Handling error', error);

        if (error instanceof Error) {
            return this.handleKnownError(error);
        }

        return ApiResponseFormatter.error(
            'InternalError',
            'An unexpected error occurred',
            error
        );
    }

    private handleKnownError(error: Error): ApiResponse<never> {
        const errorCode = this.mapErrorToCode(error);
        return ApiResponseFormatter.error(errorCode, error.message, error);
    }

    private mapErrorToCode(error: Error): ErrorCode {
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

    static create(logger?: Logger): ErrorHandler {
        return new ErrorHandler(logger);
    }
}