namespace RestFramework {
    /**
    * Token-based route definition for a single endpoint
    * Defines the wiring for an API endpoint using DI tokens
    * All components (API, request mapper, response mapper) are resolved via GasDI
    */
    export type RouteDefinition = {
        endPoint: string;
        apiToken: string;
        requestMapperToken: string;
        responseMapperToken: string;
    };

    /**
    * Generic executor that runs the API pipeline without Controller dependency
    * Resolves all components (API, requestMapper, responseMapper, errorHandler, logger) via DI
    * Executes the pipeline: map → execute → success/error
    * 
    * @param route The route definition (token-based)
    * @param normalizedRequest The normalized request context
    */
    export function executeRoute(route: RouteDefinition, normalizedRequest: Routing.NormalizedRequest) {
        // Create a scoped container for this route
        const scopedContainer = GasDI.Container.Root.createScope(route.endPoint);

        return GasDI.Context.run(scopedContainer, () => {
            // Resolve all components via DI tokens
            const api = scopedContainer.resolve<RestFramework.Interfaces.ApiLogic>(route.apiToken);
            const requestMapper = scopedContainer.resolve<RestFramework.Interfaces.RequestMapper>(route.requestMapperToken);
            const responseMapper = scopedContainer.resolve<RestFramework.Interfaces.ResponseMapper>(route.responseMapperToken);
            const logger = new RestFramework.Logger();

            logger.info('Start RequestMapper.map');
            // Pass the normalized request to the mapper
            const mappedRequest = requestMapper.map(normalizedRequest);
            logger.info('Finished RequestMapper.map');

            logger.info(`Request: ${JSON.stringify(mappedRequest)}`);

            logger.info('Start Api.execute');
            const response = api.execute(mappedRequest);
            logger.info('Finished Api.execute');

            logger.info(`Response: ${JSON.stringify(response)}`);

            logger.info('Start ResponseMapper.success');
            const mappedResponse = responseMapper.map(response);
            logger.info('Finished ResponseMapper.success');

            return mappedResponse;
        });
    }
}
