/**
 * Testing Module - Mock Doubles and Test Helpers
 */

import type { Logger, Clock } from '../shared/CommonTypes';

/**
 * Mock Logger for testing
 */
export class MockLogger implements Logger {
    private messages: { level: 'info' | 'error'; message: string }[] = [];

    info(message: string): void {
        this.messages.push({ level: 'info', message });
    }

    error(message: string): void {
        this.messages.push({ level: 'error', message });
    }

    reset(): void {
        this.messages = [];
    }

    getLastMessage(level?: 'info' | 'error'): string | undefined {
        const filtered = level ? this.messages.filter((m) => m.level === level) : this.messages;
        return filtered[filtered.length - 1]?.message;
    }

    getLastLog(level?: 'info' | 'error'): string | undefined {
        return this.getLastMessage(level);
    }

    getAllMessages(level?: 'info' | 'error'): string[] {
        const filtered = level ? this.messages.filter((m) => m.level === level) : this.messages;
        return filtered.map((m) => m.message);
    }

    getAllLogs(level?: 'info' | 'error'): string[] {
        return this.getAllMessages(level);
    }

    contains(substring: string, level?: 'info' | 'error'): boolean {
        return this.getAllMessages(level).some((msg) => msg.includes(substring));
    }
}

/**
 * Mock Clock for testing time-based logic
 */
export class MockClock implements Clock {
    private currentTime: number;

    constructor(initialTime?: number | Date) {
        this.currentTime = initialTime instanceof Date ? initialTime.getTime() : initialTime || Date.now();
    }

    now(): Date {
        // Handle invalid time edge case
        if (!Number.isFinite(this.currentTime)) {
            return new Date(NaN);
        }
        return new Date(this.currentTime);
    }

    advance(ms: number): void {
        this.currentTime += ms;
    }

    setTime(time: number | Date): void {
        this.currentTime = time instanceof Date ? time.getTime() : time;
    }

    reset(): void {
        this.currentTime = Date.now();
    }
}

/**
 * Assertion helpers for testing
 */
export namespace Assertions {
    export function assertLoggerContains(logger: MockLogger, substring: string, level?: 'info' | 'error'): void {
        if (!logger.contains(substring, level)) {
            const levelStr = level ? ` (${level})` : '';
            const messages = logger.getAllMessages(level).join('\n  ');
            throw new Error(
                `Expected logger${levelStr} to contain "${substring}".\nActual messages:\n  ${messages || '(none)'}`
            );
        }
    }

    export function assertArrayContains<T>(arr: T[], item: T, message?: string): void {
        if (!arr.includes(item)) {
            throw new Error(message || `Expected array to contain ${JSON.stringify(item)}`);
        }
    }

    export function assertDeepEqual<T>(actual: T, expected: T, message?: string): void {
        const actualJson = JSON.stringify(actual);
        const expectedJson = JSON.stringify(expected);
        if (actualJson !== expectedJson) {
            throw new Error(
                message ||
                    `Deep equality failed.\nExpected: ${expectedJson}\nActual:   ${actualJson}`
            );
        }
    }

    export function assertThrows(fn: () => void, expectedError?: string | RegExp): void {
        try {
            fn();
            throw new Error('Expected function to throw, but it did not');
        } catch (err: any) {
            if (!expectedError) return; // Just check that it throws

            const message = err?.message || String(err);
            if (typeof expectedError === 'string') {
                if (!message.includes(expectedError)) {
                    throw new Error(
                        `Expected error to contain "${expectedError}", but got: "${message}"`
                    );
                }
            } else {
                if (!expectedError.test(message)) {
                    throw new Error(
                        `Expected error to match ${expectedError}, but got: "${message}"`
                    );
                }
            }
        }
    }
}

/**
 * GAS Mock System for testing GAS-specific functionality
 */
export namespace GAS {
    /**
     * GAS Logger API mock interface
     */
    export interface MockLogger {
        logs: string[];
        log(message: string): void;
        getLastLog(): string | undefined;
        getAllLogs(): string[];
        reset(): void;
    }

    /**
     * Mock SpreadsheetApp for testing spreadsheet operations
     */
    export class MockSpreadsheetApp {
        private spreadsheets: Map<string, MockSpreadsheet> = new Map();

        setupSpreadsheet(id: string, sheets: { [sheetName: string]: any[][] }): void {
            const spreadsheet = new MockSpreadsheet(id);
            for (const [name, data] of Object.entries(sheets)) {
                spreadsheet.addSheet(name, data);
            }
            this.spreadsheets.set(id, spreadsheet);
        }

        openById(id: string): MockSpreadsheet {
            let spreadsheet = this.spreadsheets.get(id);
            if (!spreadsheet) {
                // Auto-create empty spreadsheet for testing convenience
                spreadsheet = new MockSpreadsheet(id);
                this.spreadsheets.set(id, spreadsheet);
            }
            return spreadsheet;
        }

        reset(): void {
            this.spreadsheets.clear();
        }
    }

    class MockSpreadsheet {
        private sheets: Map<string, MockSheet> = new Map();

        constructor(private id: string) {}

        addSheet(name: string, data: any[][]): void {
            this.sheets.set(name, new MockSheet(name, data));
        }

        getSheetByName(name: string): MockSheet | null {
            return this.sheets.get(name) || null;
        }

        getId(): string {
            return this.id;
        }
    }

    class MockSheet {
        private data: any[][];

        constructor(private name: string, initialData: any[][]) {
            this.data = initialData.map(row => [...row]);
        }

        getName(): string {
            return this.name;
        }

        getData(): any[][] {
            return this.data.map(row => [...row]);
        }

        getDataRange(): MockRange {
            return new MockRange(this.data, 1, 1, this.data.length, this.data[0]?.length || 0);
        }

        getRange(row: number, col: number, numRows?: number, numCols?: number): MockRange {
            if (numRows === undefined && numCols === undefined) {
                // Single cell
                return new MockRange(this.data, row, col, 1, 1);
            }
            return new MockRange(this.data, row, col, numRows || 1, numCols || 1);
        }

        getLastRow(): number {
            return this.data.length;
        }

        getLastColumn(): number {
            return this.data[0]?.length || 0;
        }

        appendRow(rowContents: any[]): void {
            this.data.push([...rowContents]);
        }

        deleteRow(rowPosition: number): void {
            if (rowPosition > 0 && rowPosition <= this.data.length) {
                this.data.splice(rowPosition - 1, 1);
            }
        }

        clear(): void {
            this.data = [];
        }
    }

    class MockRange {
        constructor(
            private sheetData: any[][],
            private row: number,
            private col: number,
            private numRows: number,
            private numCols: number
        ) {}

        getValues(): any[][] {
            const result: any[][] = [];
            for (let i = 0; i < this.numRows; i++) {
                const rowData: any[] = [];
                for (let j = 0; j < this.numCols; j++) {
                    const rowIndex = this.row - 1 + i;
                    const colIndex = this.col - 1 + j;
                    rowData.push(this.sheetData[rowIndex]?.[colIndex] ?? null);
                }
                result.push(rowData);
            }
            return result;
        }

        setValues(values: any[][]): MockRange {
            for (let i = 0; i < values.length; i++) {
                const rowIndex = this.row - 1 + i;
                if (!this.sheetData[rowIndex]) {
                    this.sheetData[rowIndex] = [];
                }
                for (let j = 0; j < values[i].length; j++) {
                    const colIndex = this.col - 1 + j;
                    this.sheetData[rowIndex][colIndex] = values[i][j];
                }
            }
            return this;
        }

        getValue(): any {
            const rowIndex = this.row - 1;
            const colIndex = this.col - 1;
            return this.sheetData[rowIndex]?.[colIndex] ?? null;
        }

        setValue(value: any): MockRange {
            const rowIndex = this.row - 1;
            const colIndex = this.col - 1;
            if (!this.sheetData[rowIndex]) {
                this.sheetData[rowIndex] = [];
            }
            this.sheetData[rowIndex][colIndex] = value;
            return this;
        }

        getNumRows(): number {
            return this.numRows;
        }

        getNumColumns(): number {
            return this.numCols;
        }
    }

    /**
     * Mock PropertiesService for testing property storage
     */
    export class MockPropertiesService {
        private scriptProperties: Map<string, string> = new Map();
        private userProperties: Map<string, string> = new Map();
        private documentProperties: Map<string, string> = new Map();

        getScriptProperties(): MockProperties {
            return new MockProperties(this.scriptProperties);
        }

        getUserProperties(): MockProperties {
            return new MockProperties(this.userProperties);
        }

        getDocumentProperties(): MockProperties {
            return new MockProperties(this.documentProperties);
        }

        reset(): void {
            this.scriptProperties.clear();
            this.userProperties.clear();
            this.documentProperties.clear();
        }
    }

    class MockProperties {
        constructor(private storage: Map<string, string>) {}

        getProperty(key: string): string | null {
            return this.storage.get(key) || null;
        }

        setProperty(key: string, value: string): MockProperties {
            this.storage.set(key, value);
            return this;
        }

        deleteProperty(key: string): MockProperties {
            this.storage.delete(key);
            return this;
        }

        getKeys(): string[] {
            return Array.from(this.storage.keys());
        }

        getProperties(): { [key: string]: string } {
            const result: { [key: string]: string } = {};
            this.storage.forEach((value, key) => {
                result[key] = value;
            });
            return result;
        }

        setProperties(properties: { [key: string]: string }): MockProperties {
            Object.entries(properties).forEach(([key, value]) => {
                this.storage.set(key, value);
            });
            return this;
        }

        deleteAllProperties(): MockProperties {
            this.storage.clear();
            return this;
        }
    }

    /**
     * Mock LockService for testing locking mechanisms
     */
    export class MockLockService {
        private locks: Map<string, MockLock> = new Map();

        getScriptLock(): MockLock {
            return this.getLock('__script__');
        }

        getUserLock(): MockLock {
            return this.getLock('__user__');
        }

        getDocumentLock(): MockLock {
            return this.getLock('__document__');
        }

        private getLock(id: string): MockLock {
            if (!this.locks.has(id)) {
                this.locks.set(id, new MockLock(id));
            }
            return this.locks.get(id)!;
        }

        reset(): void {
            this.locks.forEach(lock => lock.releaseLock());
            this.locks.clear();
        }
    }

    class MockLock {
        private acquired: boolean = false;

        constructor(private id: string) {}

        tryLock(_timeoutInMillis: number): boolean {
            if (this.acquired) {
                return false;
            }
            this.acquired = true;
            return true;
        }

        waitLock(timeoutInMillis: number): void {
            if (!this.tryLock(timeoutInMillis)) {
                throw new Error(`Failed to acquire lock ${this.id} within ${timeoutInMillis}ms`);
            }
        }

        hasLock(): boolean {
            return this.acquired;
        }

        releaseLock(): void {
            this.acquired = false;
        }
    }

    /**
     * Mock ScriptApp for testing script information
     */
    export class MockScriptApp {
        private triggers: any[] = [];

        getProjectTriggers(): any[] {
            return [...this.triggers];
        }

        getScriptTriggers(): any[] {
            return [...this.triggers];
        }

        newTrigger(functionName: string): MockTriggerBuilder {
            return new MockTriggerBuilder(functionName, this);
        }

        deleteTrigger(trigger: any): void {
            const index = this.triggers.indexOf(trigger);
            if (index > -1) {
                this.triggers.splice(index, 1);
            }
        }

        addTrigger(trigger: any): void {
            this.triggers.push(trigger);
        }

        getService(): MockWebApp {
            return new MockWebApp();
        }

        reset(): void {
            this.triggers = [];
        }
    }

    class MockTriggerBuilder {
        constructor(
            private functionName: string,
            private scriptApp: MockScriptApp
        ) {}

        timeBased(): MockTimeBasedTriggerBuilder {
            return new MockTimeBasedTriggerBuilder(this.functionName, this.scriptApp);
        }

        forSpreadsheet(_key: string): any {
            return this;
        }

        onOpen(): any {
            return this;
        }

        onEdit(): any {
            return this;
        }

        create(): any {
            const trigger = {
                functionName: this.functionName,
                type: 'custom',
                getHandlerFunction: () => this.functionName
            };
            this.scriptApp.addTrigger(trigger);
            return trigger;
        }
    }

    class MockTimeBasedTriggerBuilder {
        constructor(
            private functionName: string,
            private scriptApp: MockScriptApp
        ) {}

        everyMinutes(_n: number): MockTimeBasedTriggerBuilder {
            return this;
        }

        everyHours(_n: number): MockTimeBasedTriggerBuilder {
            return this;
        }

        everyDays(_n: number): MockTimeBasedTriggerBuilder {
            return this;
        }

        atHour(_hour: number): MockTimeBasedTriggerBuilder {
            return this;
        }

        create(): any {
            const trigger = {
                functionName: this.functionName,
                type: 'timeBased',
                getHandlerFunction: () => this.functionName
            };
            this.scriptApp.addTrigger(trigger);
            return trigger;
        }
    }

    class MockWebApp {
        getUrl(): string {
            return 'https://script.google.com/macros/s/mock-deployment-id/exec';
        }
    }

    /**
     * Mock Utilities for testing utility functions
     */
    export class MockUtilities {
        private lastSleepDuration: number = 0;

        formatDate(date: Date, timeZone: string, format: string): string {
            // Simple implementation that includes timezone in output
            const isoDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
            const time = date.toISOString().split('T')[1].split('.')[0].substring(0, 5); // HH:mm

            // Replace format placeholders
            const result = format
                .replace('yyyy', isoDate.substring(0, 4))
                .replace('MM', isoDate.substring(5, 7))
                .replace('dd', isoDate.substring(8, 10))
                .replace('HH', time.substring(0, 2))
                .replace('mm', time.substring(3, 5));

            // Include timezone information
            return `${result} (${timeZone})`;
        }

        formatString(template: string, ...args: any[]): string {
            return template.replace(/%s/g, () => String(args.shift() || ''));
        }

        sleep(milliseconds: number): void {
            this.lastSleepDuration = milliseconds;
        }

        getLastSleepDuration(): number {
            return this.lastSleepDuration;
        }

        getUuid(): string {
            return 'mock-uuid-' + Math.random().toString(36).substring(2, 15);
        }

        base64Encode(input: string): string {
            return Buffer.from(input).toString('base64');
        }

        base64Decode(encoded: string): string {
            return Buffer.from(encoded, 'base64').toString();
        }
    }

    /**
     * Mock Session for testing timezone and user methods
     */
    export class MockSession {
        private scriptTimeZone: string = 'America/New_York';
        private userEmail: string = 'test@example.com';

        getScriptTimeZone(): string {
            return this.scriptTimeZone;
        }

        setTimeZone(tz: string): void {
            this.scriptTimeZone = tz;
        }

        getActiveUser(): { getEmail: () => string } {
            return {
                getEmail: () => this.userEmail
            };
        }

        setUserEmail(email: string): void {
            this.userEmail = email;
        }

        getEffectiveUser(): { getEmail: () => string } {
            return this.getActiveUser();
        }

        /**
         * Install MockSession into global scope
         */
        static install(): void {
            mockSession = new MockSession();
            (globalThis as any).Session = mockSession;
        }
    }

    // Global mock instances
    let mockSpreadsheetApp: MockSpreadsheetApp | null = null;
    let mockPropertiesService: MockPropertiesService | null = null;
    let mockLockService: MockLockService | null = null;
    let mockScriptApp: MockScriptApp | null = null;
    let mockUtilities: MockUtilities | null = null;
    let mockSession: MockSession | null = null;
    let mockLogger: any | null = null;

    /**
     * Install all GAS mocks into global scope
     */
    export function installAll(): void {
        mockSpreadsheetApp = new MockSpreadsheetApp();
        mockPropertiesService = new MockPropertiesService();
        mockLockService = new MockLockService();
        mockScriptApp = new MockScriptApp();
        mockUtilities = new MockUtilities();
        mockSession = new MockSession();

        (globalThis as any).SpreadsheetApp = mockSpreadsheetApp;
        (globalThis as any).PropertiesService = mockPropertiesService;
        (globalThis as any).LockService = mockLockService;
        (globalThis as any).ScriptApp = mockScriptApp;
        (globalThis as any).Utilities = mockUtilities;
        (globalThis as any).Session = mockSession;

        // Install mock Logger with proper implementation
        mockLogger = {
            logs: [] as string[],
            log: function(message: string) {
                this.logs.push(message);
            },
            getLastLog: function(): string | undefined {
                return this.logs[this.logs.length - 1];
            },
            getAllLogs: function(): string[] {
                return [...this.logs];
            },
            reset: function() {
                this.logs = [];
            }
        };
        (globalThis as any).Logger = mockLogger;
    }

    /**
     * Reset all GAS mocks to initial state
     */
    export function resetAll(): void {
        mockSpreadsheetApp?.reset();
        mockPropertiesService?.reset();
        mockLockService?.reset();
        mockScriptApp?.reset();
        mockLogger?.reset();

        delete (globalThis as any).SpreadsheetApp;
        delete (globalThis as any).PropertiesService;
        delete (globalThis as any).LockService;
        delete (globalThis as any).ScriptApp;
        delete (globalThis as any).Utilities;
        delete (globalThis as any).Session;
        delete (globalThis as any).Logger;

        mockSpreadsheetApp = null;
        mockPropertiesService = null;
        mockLockService = null;
        mockScriptApp = null;
        mockUtilities = null;
        mockSession = null;
        mockLogger = null;
    }

    /**
     * Get current mock instances for advanced setup
     */
    export function getMocks() {
        return {
            SpreadsheetApp: mockSpreadsheetApp,
            PropertiesService: mockPropertiesService,
            LockService: mockLockService,
            ScriptApp: mockScriptApp,
            Utilities: mockUtilities,
            Session: mockSession,
            Logger: mockLogger
        };
    }
}
