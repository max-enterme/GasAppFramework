/**
 * RestFramework Core Components Tests
 */

import { Logger, ApiResponseFormatter, ErrorHandler } from '../../../../modules/rest-framework';

describe('RestFramework Core Components', () => {
    describe('Logger', () => {
        let consoleSpy: jest.SpyInstance;

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        it('should create logger with default prefix', () => {
            const logger = new Logger();
            logger.info('test message');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringMatching(/\[API\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z INFO: test message/)
            );
        });

        it('should create logger with custom prefix', () => {
            const logger = Logger.create('[TEST]');
            logger.info('test message');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringMatching(/\[TEST\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z INFO: test message/)
            );
        });
    });

    describe('ApiResponseFormatter', () => {
        it('should format success response', () => {
            const data = { id: 1, name: 'test' };
            const response = ApiResponseFormatter.success(data);

            expect(response).toEqual({
                success: true,
                data,
                timestamp: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
            });
        });

        it('should format error response', () => {
            const response = ApiResponseFormatter.error(
                'ValidationError',
                'Invalid input',
                { field: 'email' }
            );

            expect(response).toEqual({
                success: false,
                error: {
                    code: 'ValidationError',
                    message: 'Invalid input',
                    details: { field: 'email' }
                },
                timestamp: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
            });
        });

        it('should handle Error objects', () => {
            const error = new Error('Something went wrong');
            const response = ApiResponseFormatter.from(error, 'InternalError');

            expect(response.success).toBe(false);
            expect(response.error?.code).toBe('InternalError');
            expect(response.error?.message).toBe('Something went wrong');
        });

        it('should handle success data', () => {
            const data = { success: true };
            const response = ApiResponseFormatter.from(data);

            expect(response.success).toBe(true);
            expect(response.data).toEqual(data);
        });
    });

    describe('ErrorHandler', () => {
        let mockLogger: jest.Mocked<any>;

        beforeEach(() => {
            mockLogger = {
                info: jest.fn(),
                error: jest.fn()
            };
        });

        it('should handle Error instances', () => {
            const errorHandler = new ErrorHandler(mockLogger);
            const error = new Error('Validation failed');

            const response = errorHandler.handle(error);

            expect(response.success).toBe(false);
            expect(response.error?.code).toBe('ValidationError');
            expect(response.error?.message).toBe('Validation failed');
            expect(mockLogger.error).toHaveBeenCalledWith(
                'Error occurred: ValidationError',
                expect.objectContaining({
                    code: 'ValidationError',
                    message: 'Validation failed'
                })
            );
        });

        it('should handle unknown errors', () => {
            const errorHandler = new ErrorHandler(mockLogger);
            const error = { unknown: 'object' };

            const response = errorHandler.handle(error);

            expect(response.success).toBe(false);
            expect(response.error?.code).toBe('InternalError');
            expect(response.error?.message).toBe('An unexpected error occurred');
        });

        it('should map error messages to correct codes', () => {
            const errorHandler = new ErrorHandler(mockLogger);

            const authError = new Error('Unauthorized access');
            const authResponse = errorHandler.handle(authError);
            expect(authResponse.error?.code).toBe('AuthenticationError');

            const notFoundError = new Error('User not found');
            const notFoundResponse = errorHandler.handle(notFoundError);
            expect(notFoundResponse.error?.code).toBe('NotFound');
        });
    });
});
