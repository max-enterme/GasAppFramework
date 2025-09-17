/**
 * Middleware manager interface for API RestFramework (optional)
 */
declare namespace RestFramework {
    namespace Interfaces {
        /** Manages middleware execution pipeline */
        interface IMiddlewareManager<TContext = any> {
            execute(context: TContext, next: () => any): any;
        }
    }
}