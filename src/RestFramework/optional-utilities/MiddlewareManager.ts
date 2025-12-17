/**
 * Middleware manager interface for API RestFramework (optional)
 */
declare namespace RestFramework {
    namespace Interfaces {
        /** Manages middleware execution pipeline */
        interface MiddlewareManager<TContext = any> {
            execute(context: TContext, next: () => any): any;
        }
    }
}