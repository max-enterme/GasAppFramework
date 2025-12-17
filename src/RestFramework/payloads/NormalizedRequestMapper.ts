namespace RestFramework {
    /**
     * Base class for RequestMappers that use NormalizedRequest
     * Provides helper methods to access values with proper typing and defaults
     */
    export abstract class NormalizedRequestMapper<TRequest> implements RestFramework.Interfaces.RequestMapper<Routing.NormalizedRequest, TRequest> {
        protected request: Routing.NormalizedRequest | undefined;

        /**
         * Get a string value from normalized request
         * @param key The key to retrieve
         * @param defaultValue Optional default if key is missing or empty
         */
        protected getString(key: string, defaultValue?: string): string | undefined {
            const v = this.request?.[key];
            if (v === undefined || v === null || v === '') {
                return defaultValue;
            }
            return String(v);
        }

        /**
         * Get a number value from normalized request
         * @param key The key to retrieve
         * @param defaultValue Optional default if key is missing or not a valid number
         */
        protected getNumber(key: string, defaultValue?: number): number | undefined {
            const v = this.request?.[key];
            if (v === undefined || v === null) {
                return defaultValue;
            }
            if (typeof v === 'number' && !Number.isNaN(v)) {
                return v;
            }
            const n = Number(v);
            return Number.isNaN(n) ? defaultValue : n;
        }

        /**
         * Get a boolean value from normalized request
         * @param key The key to retrieve
         * @param defaultValue Optional default if key is missing
         */
        protected getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
            const v = this.request?.[key];
            if (v === undefined || v === null) {
                return defaultValue;
            }
            if (typeof v === 'boolean') {
                return v;
            }
            // Handle string coercion
            if (v === 'true' || v === '1' || v === 1) return true;
            if (v === 'false' || v === '0' || v === 0) return false;
            return defaultValue;
        }

        /**
         * Require a string value - throws if missing or empty
         * @param key The key to retrieve
         */
        protected requireString(key: string): string {
            const v = this.getString(key);
            if (v === undefined) {
                throw new Error(`Missing required parameter '${key}'`);
            }
            return v;
        }

        /**
         * Require a number value - throws if missing or not a valid number
         * @param key The key to retrieve
         */
        protected requireNumber(key: string): number {
            const v = this.getNumber(key);
            if (v === undefined) {
                throw new Error(`Missing required parameter '${key}'`);
            }
            return v;
        }

        /**
         * Require a boolean value - throws if missing
         * @param key The key to retrieve
         */
        protected requireBoolean(key: string): boolean {
            const v = this.getBoolean(key);
            if (v === undefined) {
                throw new Error(`Missing required parameter '${key}'`);
            }
            return v;
        }

        /**
         * Map method to be implemented by concrete mappers
         */
        map(request: Routing.NormalizedRequest): TRequest {
            this.request = request;
            return this.mapInternal();
        }

        protected abstract mapInternal(): TRequest;
    }
}
