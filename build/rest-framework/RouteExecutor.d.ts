/**
 * RestFramework - Route Executor
 */
import type * as Types from './Types';
import type { Container } from '../di';
/**
 * Generic executor that runs the API pipeline without Controller dependency
 * Resolves all components (API, requestMapper, responseMapper, errorHandler, logger) via DI
 * Executes the pipeline: map → execute → success/error
 *
 * IMPORTANT GAS COMPATIBILITY NOTES:
 * - Google Apps Script does not support native Promises in synchronous execution contexts
 * - All API logic must be synchronous to ensure compatibility
 * - Token lifecycles are managed per-request using scoped containers
 * - Always dispose scoped containers to prevent resource leaks
 *
 * @param route The route definition (token-based)
 * @param normalizedRequest The normalized request context
 * @param rootContainer The root DI container
 * @returns The mapped response or error response
 */
export declare function executeRoute(route: Types.RouteDefinition, normalizedRequest: Types.NormalizedRequest, rootContainer: Container): any;
//# sourceMappingURL=RouteExecutor.d.ts.map