/**
 * Core type definitions for API RestFramework
 */
declare namespace RestFramework {
    namespace Types {
        /** Standard API response structure */
        interface ApiResponse<T = any> {
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
        interface ApiRequest<T = any> {
            method: string;
            path: string;
            params?: Record<string, any>;
            body?: T;
            headers?: Record<string, string>;
        }

        /** Framework error codes */
        type ErrorCode = 
            | 'ValidationError'
            | 'AuthenticationError' 
            | 'AuthorizationError'
            | 'NotFound'
            | 'MethodNotAllowed'
            | 'InternalError'
            | 'BadRequest';

        /** Request mapper interface */
        interface RequestMapper<TInput = any, TOutput = any> {
            map(input: TInput): TOutput;
        }

        /** Response mapper interface */
        interface ResponseMapper<TInput = any, TOutput = any> {
            map(input: TInput): TOutput;
        }

        /** Business logic interface */
        interface ApiLogic<TRequest = any, TResponse = any> {
            execute(request: TRequest): TResponse | Promise<TResponse>;
        }

        /** Request validator interface (optional) */
        interface RequestValidator<T = any> {
            validate(request: T): { isValid: boolean; errors?: string[] };
        }

        /** Authentication service interface (optional) */
        interface AuthService {
            authenticate(token?: string): { isAuthenticated: boolean; user?: any };
            authorize(user: any, resource: string, action: string): boolean;
        }

        /** Middleware manager interface (optional) */
        interface MiddlewareManager<TContext = any> {
            execute(context: TContext, next: () => any): any;
        }
    }
}