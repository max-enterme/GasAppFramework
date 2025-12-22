/**
 * Request mapper interface for API RestFramework
 */
declare namespace RestFramework {
    namespace Interfaces {
        /** Maps raw input to structured request objects */
        interface RequestMapper<TInput = any, TOutput = any> {
            map(input: TInput): TOutput;
        }
    }
}