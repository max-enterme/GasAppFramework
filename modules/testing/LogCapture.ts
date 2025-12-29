/**
 * Testing Module - Log Capture
 * Captures console.log output during test execution
 */

export interface LogEntry {
    timestamp: number;
    message: string;
    args: any[];
}

/**
 * Log capture context for collecting console output
 */
export class LogCapture {
    private logs: LogEntry[] = [];
    private originalConsoleLog: typeof console.log;
    private capturing = false;
    private consoleOverridden = false;

    constructor() {
        this.originalConsoleLog = console.log;
    }

    /**
     * Start capturing console.log output
     * Note: In GAS environment, console.log override may not work due to read-only property.
     * Use testLog() function instead for reliable log capturing in GAS.
     */
    start(): void {
        if (this.capturing) {
            return;
        }

        this.logs = [];
        this.capturing = true;

        // Try to override console.log - if it fails, just continue without it
        // In GAS, this will fail silently and testLog() should be used instead
        if (!this.consoleOverridden) {
            const self = this;
            try {
                console.log = function (...args: any[]) {
                    // Store the log entry
                    self.logs.push({
                        timestamp: Date.now(),
                        message: args.map(arg => String(arg)).join(' '),
                        args: args
                    });
                    // Also call the original console.log
                    self.originalConsoleLog.apply(console, args);
                };
                this.consoleOverridden = true;
            } catch (e) {
                // Silently fail - GAS environment doesn't allow console.log override
                // Users should use testLog() instead
            }
        }
    }

    /**
     * Stop capturing and restore original console.log
     */
    stop(): void {
        if (!this.capturing) {
            return;
        }

        if (this.consoleOverridden) {
            try {
                console.log = this.originalConsoleLog;
            } catch (e) {
                // Ignore errors during restoration
            }
        }
        this.capturing = false;
    }

    /**
     * Get captured logs
     */
    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    /**
     * Clear captured logs
     */
    clear(): void {
        this.logs = [];
    }

    /**
     * Get logs as formatted strings
     */
    getFormattedLogs(): string[] {
        return this.logs.map(entry => entry.message);
    }

    /**
     * Manual log recording (for use when console.log override is not possible)
     * Use this in GAS environment: testLog('message') instead of console.log('message')
     */
    record(...args: any[]): void {
        if (this.capturing) {
            this.logs.push({
                timestamp: Date.now(),
                message: args.map(arg => String(arg)).join(' '),
                args: args
            });
        }
        // Also output to console
        this.originalConsoleLog.apply(console, args);
    }
}

/**
 * Global log capture instance
 */
let globalLogCapture: LogCapture | null = null;

/**
 * Get or create global log capture instance
 */
export function getGlobalLogCapture(): LogCapture {
    if (!globalLogCapture) {
        globalLogCapture = new LogCapture();
    }
    return globalLogCapture;
}

/**
 * Helper to capture logs during function execution
 */
export async function captureLogsAsync<T>(fn: () => Promise<T>): Promise<{ result: T; logs: LogEntry[] }> {
    const capture = getGlobalLogCapture();
    capture.clear();
    capture.start();

    try {
        const result = await fn();
        return { result, logs: capture.getLogs() };
    } finally {
        capture.stop();
    }
}

/**
 * Synchronous version of log capture
 */
export function captureLogs<T>(fn: () => T): { result: T; logs: LogEntry[] } {
    const capture = getGlobalLogCapture();
    capture.clear();
    capture.start();

    try {
        const result = fn();
        return { result, logs: capture.getLogs() };
    } finally {
        capture.stop();
    }
}

/**
 * Test log function for use in GAS tests (works in both GAS and Node.js)
 * Use this instead of console.log in tests to ensure logs are captured
 *
 * @example
 * T.register('My Test', 'Category', () => {
 *     testLog('Starting test...');
 *     const result = someFunction();
 *     testLog('Result:', result);
 * });
 */
export function testLog(...args: any[]): void {
    const capture = getGlobalLogCapture();
    capture.record(...args);
}
