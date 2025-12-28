/**
 * RestFramework - API Controller Base Class
 */
import type * as Types from './Types';
import type { Logger as ILogger } from '../shared';
import { ErrorHandler } from './ErrorHandler';
/**
 * Abstract base controller for API endpoints
 * Provides standardized request/response handling with dependency injection support
 */
export declare class ApiController<TRequest = any, TResponse = any> {
    protected readonly _requestMapper: Types.RequestMapper<any, TRequest>;
    protected readonly _responseMapper: Types.ResponseMapper<TResponse, any>;
    protected readonly _apiLogic: Types.ApiLogic<TRequest, TResponse>;
    protected readonly _requestValidator?: Types.RequestValidator<TRequest>;
    protected readonly _authService?: Types.AuthService;
    protected readonly _middlewareManager?: Types.MiddlewareManager;
    protected readonly _logger: ILogger;
    protected readonly _errorHandler: ErrorHandler;
    constructor(_requestMapper: Types.RequestMapper<any, TRequest>, _responseMapper: Types.ResponseMapper<TResponse, any>, _apiLogic: Types.ApiLogic<TRequest, TResponse>, _requestValidator?: Types.RequestValidator<TRequest>, _authService?: Types.AuthService, _middlewareManager?: Types.MiddlewareManager, _logger?: ILogger, _errorHandler?: ErrorHandler);
    /**
     * Main entry point for handling requests
     * Follows the complete request/response pipeline
     */
    handle(rawRequest: any): Types.ApiResponse<any>;
    /**
     * Core request processing pipeline
     */
    private processRequest;
    /**
     * Template method for handling specific HTTP methods
     * Override in concrete controllers for method-specific logic
     */
    protected handleMethod(method: string, _request: TRequest): TResponse;
}
//# sourceMappingURL=ApiController.d.ts.map