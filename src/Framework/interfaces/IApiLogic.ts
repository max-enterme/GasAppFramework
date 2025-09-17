/**
 * Business logic interface for API Framework
 */
declare namespace Framework {
    namespace Interfaces {
        /** Encapsulates business logic execution */
        interface IApiLogic<TRequest = any, TResponse = any> {
            execute(request: TRequest): TResponse | Promise<TResponse>;
        }
    }
}