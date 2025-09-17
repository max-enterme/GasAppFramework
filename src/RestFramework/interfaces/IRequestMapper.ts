/**
 * Request mapper interface for API RestFramework
 */
declare namespace RestFramework {
    namespace Interfaces {
        /** Maps raw input to structured request objects */
        interface IRequestMapper<TInput = any, TOutput = any> {
            map(input: TInput): TOutput;
        }
    }
}