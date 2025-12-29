/**
 * RestFramework - Route Executor
 */

import type * as Types from './Types';
import type { Logger as ILogger } from '../shared';
import type { Container } from '../di';
import { Logger } from './Logger';
import { ErrorHandler } from './ErrorHandler';
import { Context } from '../di';

/**
 * Validates a DI token before resolution
 * @param token The token to validate
 * @param componentName Descriptive name of the component being resolved
 * @throws Error if token is invalid
 */
function validateToken(token: string, componentName: string): void {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
        throw new Error(
            `Invalid DI token for ${componentName}: token must be a non-empty string`
        );
    }
}

/**
 * Safely resolves a dependency from the container with validation and error handling
 * @param container The DI container
 * @param token The DI token to resolve
 * @param componentName Descriptive name of the component being resolved
 * @param logger The logger instance
 * @returns The resolved dependency
 * @throws Error if resolution fails
 */
function safeResolve<T>(
    container: Container,
    token: string,
    componentName: string,
    logger: ILogger
): T {
    try {
        validateToken(token, componentName);
        logger.info(`Resolving ${componentName} with token: ${token}`);
        return container.resolve<T>(token);
    } catch (error) {
        logger.error(`Failed to resolve ${componentName} with token: ${token}`, error);
        throw new Error(
            `Dependency resolution failed for ${componentName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Logging helper utility to consolidate repeated logging logic
 * @param logger The logger instance
 * @param stage The execution stage name
 * @param action Either 'start' or 'end'
 */
function logExecutionStage(logger: ILogger, stage: string, action: 'start' | 'end'): void {
    const prefix = action === 'start' ? 'Start' : 'Finished';
    logger.info(`${prefix} ${stage}`);
}

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
export function executeRoute(
    route: Types.RouteDefinition,
    normalizedRequest: Types.NormalizedRequest,
    rootContainer: Container
) {
    // Create a scoped container for this route
    const scopedContainer = rootContainer.createScope(route.endPoint);

    try {
        return Context.run(scopedContainer, () => {
            // Initialize or resolve logger
            const logger = route.loggerToken
                ? safeResolve<ILogger>(
                      scopedContainer,
                      route.loggerToken,
                      'Logger',
                      new Logger(`[RouteExecutor:${route.endPoint}]`) // temporary logger for resolution logging
                  )
                : new Logger(`[RouteExecutor:${route.endPoint}]`);

            // Initialize or resolve ErrorHandler component for centralized error handling
            const errorHandler = route.errorHandlerToken
                ? safeResolve<ErrorHandler>(
                      scopedContainer,
                      route.errorHandlerToken,
                      'ErrorHandler',
                      logger
                  )
                : new ErrorHandler(logger);

            try {
                // Resolve all components via DI tokens with validation
                const api = safeResolve<Types.ApiLogic>(
                    scopedContainer,
                    route.apiToken,
                    'ApiLogic',
                    logger
                );
                const requestMapper = safeResolve<Types.RequestMapper>(
                    scopedContainer,
                    route.requestMapperToken,
                    'RequestMapper',
                    logger
                );
                const responseMapper = safeResolve<Types.ResponseMapper>(
                    scopedContainer,
                    route.responseMapperToken,
                    'ResponseMapper',
                    logger
                );

                // Execute request mapping
                logExecutionStage(logger, 'RequestMapper.map', 'start');
                const mappedRequest = requestMapper.map(normalizedRequest);
                logExecutionStage(logger, 'RequestMapper.map', 'end');

                logger.info(`Request: ${JSON.stringify(mappedRequest)}`);

                // Execute API logic
                logExecutionStage(logger, 'Api.execute', 'start');
                const response = api.execute(mappedRequest);
                logExecutionStage(logger, 'Api.execute', 'end');

                logger.info(`Response: ${JSON.stringify(response)}`);

                // Map response
                logExecutionStage(logger, 'ResponseMapper.map', 'start');
                const mappedResponse = responseMapper.map(response);
                logExecutionStage(logger, 'ResponseMapper.map', 'end');

                return mappedResponse;
            } catch (error) {
                // Centralized error handling with ErrorHandler
                logger.error('Error during route execution', error);
                return errorHandler.handle(error, {
                    request: normalizedRequest,
                    timestamp: new Date().toISOString()
                });
            }
        });
    } finally {
        // Cleanup scoped container to avoid resource leaks
        // Must be called outside Context.run to ensure proper cleanup
        scopedContainer.dispose();
    }
}
