/**
 * RestFramework Module - Type Definitions
 */

/** Standard API response structure */
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

/** HTTP-like request structure for GAS compatibility */
export interface ApiRequest<T = any> {
    method: string;
    path: string;
    params?: Record<string, any>;
    body?: T;
    headers?: Record<string, string>;
}

/** Framework error codes */
export type ErrorCode =
    | 'ValidationError'
    | 'AuthenticationError'
    | 'AuthorizationError'
    | 'NotFound'
    | 'MethodNotAllowed'
    | 'InternalError'
    | 'BadRequest';

/** Request mapper interface */
export interface RequestMapper<TInput = any, TOutput = any> {
    map(input: TInput): TOutput;
}

/** Response mapper interface */
export interface ResponseMapper<TInput = any, TOutput = any> {
    map(input: TInput): TOutput;
}

/** Business logic interface */
export interface ApiLogic<TRequest = any, TResponse = any> {
    execute(request: TRequest): TResponse | Promise<TResponse>;
}

/** Request validator interface (optional) */
export interface RequestValidator<T = any> {
    validate(request: T): { isValid: boolean; errors?: string[] };
}

/** Authentication service interface (optional) */
export interface AuthService {
    authenticate(token?: string): { isAuthenticated: boolean; user?: any };
    authorize(user: any, resource: string, action: string): boolean;
}

/** Middleware manager interface (optional) */
export interface MiddlewareManager<TContext = any> {
    execute(context: TContext, next: () => any): any;
}

/** Normalized request type */
export type NormalizedRequest = { [key: string]: any };

/** Route definition for DI-based routing */
export type RouteDefinition = {
    endPoint: string;
    apiToken: string;
    requestMapperToken: string;
    responseMapperToken: string;
    loggerToken?: string;
    errorHandlerToken?: string;
};
