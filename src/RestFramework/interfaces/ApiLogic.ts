/**
 * Business logic interface for API RestFramework
 */
declare namespace RestFramework {
    namespace Interfaces {
        /** Encapsulates business logic execution */
        interface ApiLogic<TRequest = any, TResponse = any> {
            execute(request: TRequest): TResponse | Promise<TResponse>;
        }
    }
}