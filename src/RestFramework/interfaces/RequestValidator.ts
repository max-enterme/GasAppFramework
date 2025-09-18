/**
 * Request validator interface for API RestFramework (optional)
 */
declare namespace RestFramework {
    namespace Interfaces {
        /** Validates incoming requests */
        interface RequestValidator<T = any> {
            validate(request: T): { isValid: boolean; errors?: string[] };
        }
    }
}