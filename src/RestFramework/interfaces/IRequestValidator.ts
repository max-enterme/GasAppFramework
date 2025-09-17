/**
 * Request validator interface for API RestFramework (optional)
 */
declare namespace RestFramework {
    namespace Interfaces {
        /** Validates incoming requests */
        interface IRequestValidator<T = any> {
            validate(request: T): { isValid: boolean; errors?: string[] };
        }
    }
}