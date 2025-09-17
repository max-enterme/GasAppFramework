/**
 * Request validator interface for API Framework (optional)
 */
declare namespace Framework {
    namespace Interfaces {
        /** Validates incoming requests */
        interface IRequestValidator<T = any> {
            validate(request: T): { isValid: boolean; errors?: string[] };
        }
    }
}