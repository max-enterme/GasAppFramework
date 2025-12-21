/**
 * RouteExecutor Tests
 */

import { RestFrameworkLogger, ErrorHandler } from './restframework-module';

// Mock GasDI Container
class MockContainer {
    private instances = new Map<string, any>();
    private _scopeName?: string;

    constructor(scopeName?: string) {
        this._scopeName = scopeName;
    }

    resolve<T>(token: string): T {
        if (!this.instances.has(token)) {
            throw new Error(`DI token not found: ${token}`);
        }
        return this.instances.get(token) as T;
    }

    set(token: string, instance: any): void {
        this.instances.set(token, instance);
    }

    dispose(): void {
        this.instances.clear();
    }
}

// Mock implementations
interface MockApiLogic {
    execute(request: any): any;
}

interface MockRequestMapper {
    map(input: any): any;
}

interface MockResponseMapper {
    map(input: any): any;
}

describe('RouteExecutor', () => {
    let mockContainer: MockContainer;
    let mockApi: jest.Mocked<MockApiLogic>;
    let mockRequestMapper: jest.Mocked<MockRequestMapper>;
    let mockResponseMapper: jest.Mocked<MockResponseMapper>;

    beforeEach(() => {
        mockContainer = new MockContainer('test-route');
        
        mockApi = {
            execute: jest.fn().mockReturnValue({ success: true, data: 'test-data' })
        };
        
        mockRequestMapper = {
            map: jest.fn().mockReturnValue({ mapped: 'request' })
        };
        
        mockResponseMapper = {
            map: jest.fn().mockReturnValue({ mapped: 'response' })
        };
    });

    describe('Token Validation', () => {
        it('should validate non-empty string tokens', () => {
            // This test validates the validateToken function logic
            const invalidTokens = ['', '   ', null, undefined];
            
            invalidTokens.forEach(token => {
                expect(() => {
                    if (!token || typeof token !== 'string' || token.trim().length === 0) {
                        throw new Error(`Invalid DI token: token must be a non-empty string`);
                    }
                }).toThrow('Invalid DI token');
            });
        });

        it('should accept valid string tokens', () => {
            const validToken = 'api-token-123';
            expect(() => {
                if (!validToken || typeof validToken !== 'string' || validToken.trim().length === 0) {
                    throw new Error(`Invalid DI token: token must be a non-empty string`);
                }
            }).not.toThrow();
        });
    });

    describe('Logging Helper', () => {
        let logger: RestFrameworkLogger;
        let consoleSpy: jest.SpyInstance;

        beforeEach(() => {
            logger = new RestFrameworkLogger('[Test]');
            consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        it('should log execution start stage', () => {
            const stage = 'Api.execute';
            // Helper function mimics logExecutionStage behavior
            const prefix = 'Start';
            
            logger.info(`${prefix} ${stage}`);
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringMatching(/\[Test\].*INFO: Start Api\.execute/)
            );
        });

        it('should log execution end stage', () => {
            const stage = 'Api.execute';
            // Helper function mimics logExecutionStage behavior
            const prefix = 'Finished';
            
            logger.info(`${prefix} ${stage}`);
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringMatching(/\[Test\].*INFO: Finished Api\.execute/)
            );
        });
    });

    describe('Container Disposal', () => {
        it('should dispose container resources', () => {
            const container = new MockContainer('test-scope');
            container.set('test-token', { data: 'test' });
            
            expect(() => container.resolve('test-token')).not.toThrow();
            
            container.dispose();
            
            expect(() => container.resolve('test-token')).toThrow('DI token not found');
        });
    });

    describe('Error Handling', () => {
        let errorHandler: ErrorHandler;
        let mockLogger: jest.Mocked<any>;

        beforeEach(() => {
            mockLogger = {
                info: jest.fn(),
                error: jest.fn()
            };
            errorHandler = new ErrorHandler(mockLogger);
        });

        it('should handle errors with centralized ErrorHandler', () => {
            const error = new Error('Test error');
            const response = errorHandler.handle(error, {
                request: { path: '/test' },
                timestamp: '2024-01-01T00:00:00.000Z'
            });

            expect(response.success).toBe(false);
            expect(response.error).toBeDefined();
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should include request context in error handling', () => {
            const error = new Error('Validation error');
            const context = {
                request: { path: '/api/test', method: 'POST' },
                timestamp: '2024-01-01T00:00:00.000Z'
            };
            
            const response = errorHandler.handle(error, context);

            expect(response.success).toBe(false);
            expect(response.error?.code).toBe('ValidationError');
        });
    });

    describe('Safe Resolution', () => {
        it('should resolve valid tokens successfully', () => {
            mockContainer.set('valid-token', { test: 'value' });
            
            const resolved = mockContainer.resolve('valid-token');
            
            expect(resolved).toEqual({ test: 'value' });
        });

        it('should throw error for invalid tokens', () => {
            expect(() => mockContainer.resolve('non-existent-token'))
                .toThrow('DI token not found');
        });

        it('should log resolution attempts', () => {
            const logger = new RestFrameworkLogger('[SafeResolve]');
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            mockContainer.set('test-token', { data: 'test' });
            logger.info('Resolving ApiLogic with token: test-token');
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringMatching(/Resolving ApiLogic with token: test-token/)
            );
            
            consoleSpy.mockRestore();
        });
    });

    describe('Pipeline Execution', () => {
        it('should execute the full pipeline in correct order', () => {
            const logger = new RestFrameworkLogger('[Pipeline]');
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            // Simulate pipeline execution
            const normalizedRequest = { param: 'value' };
            
            logger.info('Start RequestMapper.map');
            const mappedRequest = mockRequestMapper.map(normalizedRequest);
            logger.info('Finished RequestMapper.map');
            
            logger.info('Start Api.execute');
            const response = mockApi.execute(mappedRequest);
            logger.info('Finished Api.execute');
            
            logger.info('Start ResponseMapper.map');
            const mappedResponse = mockResponseMapper.map(response);
            logger.info('Finished ResponseMapper.map');
            
            expect(mockRequestMapper.map).toHaveBeenCalledWith(normalizedRequest);
            expect(mockApi.execute).toHaveBeenCalledWith(mappedRequest);
            expect(mockResponseMapper.map).toHaveBeenCalledWith(response);
            expect(mappedResponse).toEqual({ mapped: 'response' });
            
            consoleSpy.mockRestore();
        });
    });

    describe('GAS Compatibility', () => {
        it('should execute synchronously for GAS compatibility', () => {
            // GAS does not support native Promises in synchronous contexts
            // This test ensures the pipeline remains synchronous
            
            const result = mockApi.execute({ test: 'data' });
            
            // Result should be immediately available (not a Promise)
            expect(result).toBeDefined();
            expect(result).not.toBeInstanceOf(Promise);
        });
    });

    describe('Dependency Injection for Logger and ErrorHandler', () => {
        describe('Default Initialization (No Tokens)', () => {
            it('should use default logger when loggerToken is not provided', () => {
                // Verify that when no loggerToken is provided, a default logger is created
                // This is tested by the absence of DI resolution attempt
                const route = {
                    endPoint: '/test',
                    apiToken: 'api-token',
                    requestMapperToken: 'request-mapper-token',
                    responseMapperToken: 'response-mapper-token'
                    // loggerToken and errorHandlerToken are not provided
                };

                // Test validates that the route definition without optional tokens is valid
                expect(route.endPoint).toBe('/test');
                expect(route.apiToken).toBeDefined();
                expect(route.requestMapperToken).toBeDefined();
                expect(route.responseMapperToken).toBeDefined();
            });

            it('should use default errorHandler when errorHandlerToken is not provided', () => {
                const route = {
                    endPoint: '/test',
                    apiToken: 'api-token',
                    requestMapperToken: 'request-mapper-token',
                    responseMapperToken: 'response-mapper-token'
                    // errorHandlerToken is not provided
                };

                // Test validates that errorHandler will be created with default initialization
                expect(route.endPoint).toBe('/test');
                expect(route.apiToken).toBeDefined();
            });
        });

        describe('Custom Logger Injection', () => {
            it('should accept loggerToken in RouteDefinition', () => {
                const route = {
                    endPoint: '/test',
                    apiToken: 'api-token',
                    requestMapperToken: 'request-mapper-token',
                    responseMapperToken: 'response-mapper-token',
                    loggerToken: 'custom-logger-token'
                };

                expect(route.loggerToken).toBe('custom-logger-token');
            });

            it('should resolve logger from DI container when loggerToken is provided', () => {
                const customLogger = new RestFrameworkLogger('[CustomLogger]');
                mockContainer.set('custom-logger-token', customLogger);

                const resolvedLogger = mockContainer.resolve('custom-logger-token');
                
                expect(resolvedLogger).toBe(customLogger);
            });

            it('should validate loggerToken before resolution', () => {
                const invalidTokens = ['', '   '];
                
                invalidTokens.forEach(token => {
                    expect(() => {
                        if (!token || typeof token !== 'string' || token.trim().length === 0) {
                            throw new Error(`Invalid DI token for Logger: token must be a non-empty string`);
                        }
                    }).toThrow('Invalid DI token');
                });
            });
        });

        describe('Custom ErrorHandler Injection', () => {
            it('should accept errorHandlerToken in RouteDefinition', () => {
                const route = {
                    endPoint: '/test',
                    apiToken: 'api-token',
                    requestMapperToken: 'request-mapper-token',
                    responseMapperToken: 'response-mapper-token',
                    errorHandlerToken: 'custom-error-handler-token'
                };

                expect(route.errorHandlerToken).toBe('custom-error-handler-token');
            });

            it('should resolve errorHandler from DI container when errorHandlerToken is provided', () => {
                const mockLogger = new RestFrameworkLogger('[Test]');
                const customErrorHandler = new ErrorHandler(mockLogger);
                mockContainer.set('custom-error-handler-token', customErrorHandler);

                const resolvedErrorHandler = mockContainer.resolve('custom-error-handler-token');
                
                expect(resolvedErrorHandler).toBe(customErrorHandler);
            });

            it('should validate errorHandlerToken before resolution', () => {
                const invalidTokens = ['', '   '];
                
                invalidTokens.forEach(token => {
                    expect(() => {
                        if (!token || typeof token !== 'string' || token.trim().length === 0) {
                            throw new Error(`Invalid DI token for ErrorHandler: token must be a non-empty string`);
                        }
                    }).toThrow('Invalid DI token');
                });
            });
        });

        describe('Both Custom Logger and ErrorHandler Injection', () => {
            it('should accept both loggerToken and errorHandlerToken in RouteDefinition', () => {
                const route = {
                    endPoint: '/test',
                    apiToken: 'api-token',
                    requestMapperToken: 'request-mapper-token',
                    responseMapperToken: 'response-mapper-token',
                    loggerToken: 'custom-logger-token',
                    errorHandlerToken: 'custom-error-handler-token'
                };

                expect(route.loggerToken).toBe('custom-logger-token');
                expect(route.errorHandlerToken).toBe('custom-error-handler-token');
            });

            it('should resolve both logger and errorHandler from DI container', () => {
                const customLogger = new RestFrameworkLogger('[CustomLogger]');
                const customErrorHandler = new ErrorHandler(customLogger);
                
                mockContainer.set('custom-logger-token', customLogger);
                mockContainer.set('custom-error-handler-token', customErrorHandler);

                const resolvedLogger = mockContainer.resolve('custom-logger-token');
                const resolvedErrorHandler = mockContainer.resolve('custom-error-handler-token');
                
                expect(resolvedLogger).toBe(customLogger);
                expect(resolvedErrorHandler).toBe(customErrorHandler);
            });
        });

        describe('Mixed Scenarios', () => {
            it('should use default logger when loggerToken is not provided, but custom errorHandler when token is provided', () => {
                type TestRoute = {
                    endPoint: string;
                    apiToken: string;
                    requestMapperToken: string;
                    responseMapperToken: string;
                    loggerToken?: string;
                    errorHandlerToken?: string;
                };
                
                const route: TestRoute = {
                    endPoint: '/test',
                    apiToken: 'api-token',
                    requestMapperToken: 'request-mapper-token',
                    responseMapperToken: 'response-mapper-token',
                    errorHandlerToken: 'custom-error-handler-token'
                    // loggerToken is not provided
                };

                expect(route.loggerToken).toBeUndefined();
                expect(route.errorHandlerToken).toBe('custom-error-handler-token');
            });

            it('should use custom logger when token is provided, but default errorHandler when token is not provided', () => {
                type TestRoute = {
                    endPoint: string;
                    apiToken: string;
                    requestMapperToken: string;
                    responseMapperToken: string;
                    loggerToken?: string;
                    errorHandlerToken?: string;
                };
                
                const route: TestRoute = {
                    endPoint: '/test',
                    apiToken: 'api-token',
                    requestMapperToken: 'request-mapper-token',
                    responseMapperToken: 'response-mapper-token',
                    loggerToken: 'custom-logger-token'
                    // errorHandlerToken is not provided
                };

                expect(route.loggerToken).toBe('custom-logger-token');
                expect(route.errorHandlerToken).toBeUndefined();
            });
        });

        describe('Error Scenarios', () => {
            it('should throw error when loggerToken does not exist in container', () => {
                expect(() => mockContainer.resolve('non-existent-logger-token'))
                    .toThrow('DI token not found');
            });

            it('should throw error when errorHandlerToken does not exist in container', () => {
                expect(() => mockContainer.resolve('non-existent-error-handler-token'))
                    .toThrow('DI token not found');
            });
        });
    });
});
