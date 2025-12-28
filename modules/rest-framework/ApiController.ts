/**
 * RestFramework - API Controller Base Class
 */

import type * as Types from './Types';
import type { Logger as ILogger } from '../shared';
import { Logger } from './Logger';
import { ErrorHandler } from './ErrorHandler';
import { ApiResponseFormatter } from './ApiResponseFormatter';

/**
 * Abstract base controller for API endpoints
 * Provides standardized request/response handling with dependency injection support
 */
export class ApiController<TRequest = any, TResponse = any> {
    protected readonly _logger: ILogger;
    protected readonly _errorHandler: ErrorHandler;

    public constructor(
        protected readonly _requestMapper: Types.RequestMapper<any, TRequest>,
        protected readonly _responseMapper: Types.ResponseMapper<TResponse, any>,
        protected readonly _apiLogic: Types.ApiLogic<TRequest, TResponse>,
        protected readonly _requestValidator?: Types.RequestValidator<TRequest>,
        protected readonly _authService?: Types.AuthService,
        protected readonly _middlewareManager?: Types.MiddlewareManager,
        _logger?: ILogger,
        _errorHandler?: ErrorHandler
    ) {
        this._logger = _logger || Logger.create('[BaseApiController]');
        this._errorHandler = _errorHandler || ErrorHandler.create(this._logger);
    }

    /**
     * Main entry point for handling requests
     * Follows the complete request/response pipeline
     */
    public handle(rawRequest: any): Types.ApiResponse<any> {
        const timestamp = new Date().toISOString();

        try {
            this._logger.info(`Handling request: ${JSON.stringify(rawRequest)}`);

            // Execute middleware if available
            if (this._middlewareManager) {
                return this._middlewareManager.execute(rawRequest, () =>
                    this.processRequest(rawRequest)
                );
            }

            return this.processRequest(rawRequest);
        } catch (error) {
            // Pass request context to error handler for better logging
            return this._errorHandler.handle(error, {
                request: rawRequest,
                timestamp: timestamp,
            });
        }
    }

    /**
     * Core request processing pipeline
     */
    private processRequest(rawRequest: any): Types.ApiResponse<any> {
        // 1. Map raw request to typed request
        const typedRequest = this._requestMapper.map(rawRequest);

        // 2. Validate request if validator is available
        if (this._requestValidator) {
            const validation = this._requestValidator.validate(typedRequest);
            if (!validation.isValid) {
                return ApiResponseFormatter.error(
                    'ValidationError',
                    'Request validation failed',
                    { errors: validation.errors }
                );
            }
        }

        // 3. Authenticate if auth service is available
        if (this._authService) {
            const auth = this._authService.authenticate(rawRequest.token);
            if (!auth.isAuthenticated) {
                return ApiResponseFormatter.error('AuthenticationError', 'Authentication required');
            }

            // Store user context for business logic if needed
            (typedRequest as any).__user = auth.user;
        }

        // 4. Execute business logic
        const logicResult = this._apiLogic.execute(typedRequest);

        // 5. Handle async logic
        if (logicResult instanceof Promise) {
            throw new Error(
                'Async logic not supported in GAS environment. Use synchronous execution.'
            );
        }

        // 6. Map response
        const mappedResponse = this._responseMapper.map(logicResult);

        // 7. Return formatted success response
        return ApiResponseFormatter.success(mappedResponse);
    }

    /**
     * Template method for handling specific HTTP methods
     * Override in concrete controllers for method-specific logic
     */
    protected handleMethod(method: string, _request: TRequest): TResponse {
        throw new Error(`Method ${method} not supported`);
    }
}
