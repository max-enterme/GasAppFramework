namespace Framework {
    /**
     * Basic logger implementation for API Framework
     * Adapts to existing shared Logger interface
     */
    export class Logger implements Shared.Types.Logger {
        constructor(private prefix: string = '[API]') {}

        info(msg: string): void {
            console.log(`${this.prefix} ${new Date().toISOString()} INFO: ${msg}`);
        }

        error(msg: string, err?: unknown): void {
            const errorMsg = err ? ` | Error: ${err}` : '';
            console.error(`${this.prefix} ${new Date().toISOString()} ERROR: ${msg}${errorMsg}`);
        }

        /**
         * Creates a logger with custom prefix
         */
        static create(prefix: string = '[API]'): Logger {
            return new Logger(prefix);
        }
    }
}