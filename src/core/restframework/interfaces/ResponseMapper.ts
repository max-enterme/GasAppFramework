/**
 * Response mapper interface for API RestFramework
 */
declare namespace RestFramework {
    namespace Interfaces {
        /** Maps business logic output to API response format */
        interface ResponseMapper<TInput = any, TOutput = any> {
            map(input: TInput): TOutput;
        }
    }
}