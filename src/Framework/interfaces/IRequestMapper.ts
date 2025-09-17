/**
 * Request mapper interface for API Framework
 */
declare namespace Framework {
    namespace Interfaces {
        /** Maps raw input to structured request objects */
        interface IRequestMapper<TInput = any, TOutput = any> {
            map(input: TInput): TOutput;
        }
    }
}