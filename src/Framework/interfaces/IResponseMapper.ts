/**
 * Response mapper interface for API Framework
 */
declare namespace Framework {
    namespace Interfaces {
        /** Maps business logic output to API response format */
        interface IResponseMapper<TInput = any, TOutput = any> {
            map(input: TInput): TOutput;
        }
    }
}