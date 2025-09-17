namespace RestFramework {
    /**
     * Abstract base controller for API endpoints
     * Provides standardized request/response handling with dependency injection support
     */
    @GasDI.Decorators.Resolve()
    export abstract class BaseApiController<TRequest = any, TResponse = any> {
        // Required dependencies (must be provided)
        protected abstract readonly requestMapper: RestFramework.Types.IRequestMapper<any, TRequest>;
        protected abstract readonly responseMapper: RestFramework.Types.IResponseMapper<TResponse, any>;
        protected abstract readonly apiLogic: RestFramework.Types.IApiLogic<TRequest, TResponse>;

        // Optional dependencies (can be null, injected via DI)
        @GasDI.Decorators.Inject('requestValidator', true)
        protected readonly requestValidator?: RestFramework.Types.IRequestValidator<TRequest>;

        @GasDI.Decorators.Inject('authService', true)
        protected readonly authService?: RestFramework.Types.IAuthService;

        @GasDI.Decorators.Inject('middlewareManager', true)
        protected readonly middlewareManager?: RestFramework.Types.IMiddlewareManager;

        // Framework dependencies (with defaults)
        @GasDI.Decorators.Inject('logger', true)
        private readonly logger: Shared.Types.Logger = RestFramework.Logger.create('[BaseApiController]');

        @GasDI.Decorators.Inject('errorHandler', true)
        private readonly errorHandler: ErrorHandler = ErrorHandler.create(this.logger);

        /**
         * Main entry point for handling requests
         * Follows the complete request/response pipeline
         */
        public handle(rawRequest: any): RestFramework.Types.ApiResponse<any> {
            try {
                this.logger.info(`Handling request: ${JSON.stringify(rawRequest)}`);

                // Execute middleware if available
                if (this.middlewareManager) {
                    return this.middlewareManager.execute(rawRequest, () => this.processRequest(rawRequest));
                }

                return this.processRequest(rawRequest);
            } catch (error) {
                return this.errorHandler.handle(error);
            }
        }

        /**
         * Core request processing pipeline
         */
        private processRequest(rawRequest: any): RestFramework.Types.ApiResponse<any> {
            // 1. Map raw request to typed request
            const typedRequest = this.requestMapper.map(rawRequest);

            // 2. Validate request if validator is available
            if (this.requestValidator) {
                const validation = this.requestValidator.validate(typedRequest);
                if (!validation.isValid) {
                    return RestFramework.ApiResponseFormatter.error(
                        'ValidationError',
                        'Request validation failed',
                        { errors: validation.errors }
                    );
                }
            }

            // 3. Authenticate if auth service is available
            if (this.authService) {
                const auth = this.authService.authenticate(rawRequest.token);
                if (!auth.isAuthenticated) {
                    return RestFramework.ApiResponseFormatter.error(
                        'AuthenticationError',
                        'Authentication required'
                    );
                }

                // Store user context for business logic if needed
                (typedRequest as any).__user = auth.user;
            }

            // 4. Execute business logic
            const logicResult = this.apiLogic.execute(typedRequest);

            // 5. Handle async logic
            if (logicResult instanceof Promise) {
                throw new Error('Async logic not supported in GAS environment. Use synchronous execution.');
            }

            // 6. Map response
            const mappedResponse = this.responseMapper.map(logicResult);

            // 7. Return formatted success response
            return RestFramework.ApiResponseFormatter.success(mappedResponse);
        }

        /**
         * Template method for handling specific HTTP methods
         * Override in concrete controllers for method-specific logic
         */
        protected handleMethod(method: string, _request: TRequest): TResponse {
            throw new Error(`Method ${method} not supported`);
        }
    }
}