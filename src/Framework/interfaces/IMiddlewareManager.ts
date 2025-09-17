/**
 * Middleware manager interface for API Framework (optional)
 */
declare namespace Framework {
    namespace Interfaces {
        /** Manages middleware execution pipeline */
        interface IMiddlewareManager<TContext = any> {
            execute(context: TContext, next: () => any): any;
        }
    }
}