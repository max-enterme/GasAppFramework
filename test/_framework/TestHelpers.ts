/**
 * Shared Test Helpers and Doubles
 * Consolidates test utilities for better reusability
 */

namespace TestHelpers {
    /** Test doubles and mocks for common interfaces */
    export namespace Doubles {
        /** Mock logger that captures messages for testing */
        export class MockLogger implements Shared.Types.Logger {
            public messages: Array<{ level: 'info' | 'error'; msg: string; err?: unknown }> = [];

            info(msg: string): void {
                this.messages.push({ level: 'info', msg });
            }

            error(msg: string, err?: unknown): void {
                this.messages.push({ level: 'error', msg, err });
            }

            reset(): void {
                this.messages = [];
            }

            getLastMessage(): { level: 'info' | 'error'; msg: string; err?: unknown } | undefined {
                return this.messages[this.messages.length - 1];
            }
        }

        /** Mock clock for controlled time testing */
        export class MockClock implements Shared.Types.Clock {
            private currentTime: Date;

            constructor(initialTime?: Date) {
                // Use a specific valid date if no initial time provided to avoid GAS Date() issues
                const baseTime = initialTime || new Date(2024, 0, 15, 10, 0, 0); // Jan 15, 2024 10:00:00
                this.currentTime = new Date(baseTime.getTime());
            }

            now(): Date {
                return new Date(this.currentTime.getTime());
            }

            advance(ms: number): void {
                this.currentTime = new Date(this.currentTime.getTime() + ms);
            }

            setTime(time: Date): void {
                this.currentTime = new Date(time.getTime());
            }
        }

        /** Memory store for Repository testing */
        export class MemoryStore<TEntity extends object> implements Repository.Ports.Store<TEntity> {
            private data: TEntity[] = [];

            load(): { rows: TEntity[] } {
                return { rows: [...this.data] };
            }

            saveAdded(rows: TEntity[]): void {
                this.data.push(...rows);
            }

            saveUpdated(rows: { index: number; row: TEntity }[]): void {
                for (const { index, row } of rows) {
                    if (index >= 0 && index < this.data.length) {
                        this.data[index] = row;
                    }
                }
            }

            deleteByIndexes(indexes: number[]): void {
                // Sort in descending order to avoid index shifting issues
                const sortedIndexes = [...indexes].sort((a, b) => b - a);
                for (const index of sortedIndexes) {
                    if (index >= 0 && index < this.data.length) {
                        this.data.splice(index, 1);
                    }
                }
            }

            // Helper methods for testing
            clear(): void {
                this.data = [];
            }

            getDataCopy(): TEntity[] {
                return [...this.data];
            }
        }
    }

    /** Enhanced assertion helpers for testing */
    export namespace Assertions {
        /** Assert that a logger contains specific messages */
        export function assertLoggerContains(
            logger: Doubles.MockLogger,
            level: 'info' | 'error',
            messagePattern: string | RegExp
        ): void {
            const messages = logger.messages.filter(m => m.level === level);
            const found = messages.some(m => 
                typeof messagePattern === 'string' 
                    ? m.msg.includes(messagePattern)
                    : messagePattern.test(m.msg)
            );
            if (!found) {
                throw new Error(`Expected ${level} message matching "${messagePattern}" not found. Messages: ${JSON.stringify(messages)}`);
            }
        }

        /** Assert that an array contains items matching a predicate */
        export function assertArrayContains<T>(
            array: T[],
            predicate: (item: T) => boolean,
            message?: string
        ): void {
            const found = array.some(predicate);
            if (!found) {
                throw new Error(message || `Array does not contain expected item. Array: ${JSON.stringify(array)}`);
            }
        }

        /** Assert that two objects are deeply equal */
        export function assertDeepEqual(actual: any, expected: any, message?: string): void {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(message || `Objects not equal. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
            }
        }
    }

    /** Test scenario builders for common patterns */
    export namespace Scenarios {
        /** Create a basic user entity for testing */
        export function createTestUser(overrides: Partial<{ id: string; org: string; name: string }> = {}) {
            return {
                id: overrides.id || 'test-user',
                org: overrides.org || 'test-org', 
                name: overrides.name || 'Test User',
                ...overrides
            };
        }

        /** Create a repository test setup with mock dependencies */
        export function createRepositoryTestSetup<TEntity extends object, Key extends keyof TEntity>(
            schema: Repository.Ports.Schema<TEntity, Key>,
            keyCodec: Repository.Ports.KeyCodec<TEntity, Key>
        ) {
            const logger = new Doubles.MockLogger();
            const store = new Doubles.MemoryStore<TEntity>();
            
            const repository = Repository.Engine.create({
                schema,
                store,
                keyCodec,
                logger
            });

            return {
                repository,
                logger,
                store,
                // Helper to verify state
                assertStoreContains: (predicate: (entity: TEntity) => boolean) => {
                    Assertions.assertArrayContains(store.getDataCopy(), predicate);
                }
            };
        }
    }

    /** GAS Environment Simulation */
    export namespace GAS {
        /** Mock SpreadsheetApp for testing Spreadsheet-based operations */
        export class MockSpreadsheetApp {
            private spreadsheets: Map<string, MockSpreadsheet> = new Map();

            static install(): void {
                (globalThis as any).SpreadsheetApp = new MockSpreadsheetApp();
            }

            static reset(): void {
                delete (globalThis as any).SpreadsheetApp;
            }

            openById(id: string): MockSpreadsheet {
                if (!this.spreadsheets.has(id)) {
                    this.spreadsheets.set(id, new MockSpreadsheet(id));
                }
                return this.spreadsheets.get(id)!;
            }

            // Helper for tests to set up spreadsheet data
            setupSpreadsheet(id: string, sheets: { [sheetName: string]: any[][] }): MockSpreadsheet {
                const ss = new MockSpreadsheet(id);
                for (const [name, data] of Object.entries(sheets)) {
                    ss.addSheet(name, data);
                }
                this.spreadsheets.set(id, ss);
                return ss;
            }
        }

        export class MockSpreadsheet {
            private sheets: Map<string, MockSheet> = new Map();

            constructor(public readonly id: string) {}

            getSheetByName(name: string): MockSheet | null {
                return this.sheets.get(name) || null;
            }

            addSheet(name: string, data: any[][] = []): MockSheet {
                const sheet = new MockSheet(name, data);
                this.sheets.set(name, sheet);
                return sheet;
            }
        }

        export class MockSheet {
            constructor(
                public readonly name: string,
                private data: any[][] = []
            ) {}

            getDataRange(): MockRange {
                return new MockRange(this.data, 0, 0, this.data.length, this.data[0]?.length || 0);
            }

            getRange(row: number, col: number, numRows?: number, numCols?: number): MockRange {
                const startRow = row - 1; // Convert to 0-based
                const startCol = col - 1;
                const endRow = numRows ? startRow + numRows : this.data.length;
                const endCol = numCols ? startCol + numCols : (this.data[0]?.length || 0);
                
                return new MockRange(this.data, startRow, startCol, endRow, endCol);
            }

            appendRow(values: any[]): void {
                this.data.push([...values]);
            }

            getLastColumn(): number {
                return Math.max(0, ...this.data.map(row => row.length));
            }

            getLastRow(): number {
                return this.data.length;
            }

            deleteRow(rowIndex: number): void {
                if (rowIndex > 0 && rowIndex <= this.data.length) {
                    this.data.splice(rowIndex - 1, 1); // Convert to 0-based
                }
            }

            // Helper for tests
            setData(data: any[][]): void {
                this.data = data.map(row => [...row]);
            }

            getData(): any[][] {
                return this.data.map(row => [...row]);
            }
        }

        export class MockRange {
            constructor(
                private sheetData: any[][],
                private startRow: number = 0,
                private startCol: number = 0,
                private endRow?: number,
                private endCol?: number
            ) {
                this.endRow = endRow ?? sheetData.length;
                this.endCol = endCol ?? (sheetData[0]?.length || 0);
            }

            getValues(): any[][] {
                const result: any[][] = [];
                for (let r = this.startRow; r < this.endRow! && r < this.sheetData.length; r++) {
                    const rowData: any[] = [];
                    for (let c = this.startCol; c < this.endCol! && c < (this.sheetData[r]?.length || 0); c++) {
                        rowData.push(this.sheetData[r][c]);
                    }
                    result.push(rowData);
                }
                return result;
            }

            setValues(values: any[][]): void {
                // Ensure sheet has enough rows and columns
                for (let r = 0; r < values.length; r++) {
                    const targetRow = this.startRow + r;
                    while (this.sheetData.length <= targetRow) {
                        this.sheetData.push([]);
                    }
                    
                    for (let c = 0; c < values[r].length; c++) {
                        const targetCol = this.startCol + c;
                        while (this.sheetData[targetRow].length <= targetCol) {
                            this.sheetData[targetRow].push('');
                        }
                        this.sheetData[targetRow][targetCol] = values[r][c];
                    }
                }
            }

            setValue(value: any): void {
                // For single cell ranges, set the first cell
                this.setValues([[value]]);
            }

            getNumRows(): number {
                return Math.min(this.endRow! - this.startRow, this.sheetData.length - this.startRow);
            }

            getNumColumns(): number {
                return Math.min(this.endCol! - this.startCol, (this.sheetData[this.startRow]?.length || 0) - this.startCol);
            }
        }

        /** Mock ScriptApp for testing triggers and script properties */
        export class MockScriptApp {
            private triggers: MockTrigger[] = [];
            private properties: { [key: string]: string } = {};

            static install(): void {
                (globalThis as any).ScriptApp = new MockScriptApp();
            }

            static reset(): void {
                delete (globalThis as any).ScriptApp;
            }

            newTrigger(functionName: string): MockTriggerBuilder {
                return new MockTriggerBuilder(functionName, (trigger) => {
                    this.triggers.push(trigger);
                    return trigger;
                });
            }

            getScriptTriggers(): MockTrigger[] {
                return [...this.triggers];
            }

            deleteTrigger(trigger: MockTrigger): void {
                const index = this.triggers.indexOf(trigger);
                if (index >= 0) {
                    this.triggers.splice(index, 1);
                }
            }

            getProjectTriggers(): MockTrigger[] {
                return this.getScriptTriggers();
            }

            // Helper for tests
            reset(): void {
                this.triggers = [];
                this.properties = {};
            }
        }

        export class MockTriggerBuilder {
            private eventType: string = '';
            private source: any = null;

            constructor(
                private functionName: string,
                private onCreate: (trigger: MockTrigger) => MockTrigger
            ) {}

            timeBased(): MockTimeTriggerBuilder {
                return new MockTimeTriggerBuilder(this.functionName, this.onCreate);
            }

            create(): MockTrigger {
                const trigger = new MockTrigger(this.functionName, this.eventType, this.source);
                return this.onCreate(trigger);
            }
        }

        export class MockTimeTriggerBuilder extends MockTriggerBuilder {
            private interval: string = '';

            everyHours(hours: number): this {
                this.interval = `${hours}h`;
                return this;
            }

            everyDays(days: number): this {
                this.interval = `${days}d`;
                return this;
            }

            at(time: Date): this {
                this.interval = `at:${time.getTime()}`;
                return this;
            }

            create(): MockTrigger {
                const trigger = new MockTrigger(this.functionName, 'TIME_DRIVEN', { interval: this.interval });
                return (this as any).onCreate(trigger);
            }
        }

        export class MockTrigger {
            constructor(
                public readonly handlerFunction: string,
                public readonly eventType: string,
                public readonly source: any
            ) {}

            getHandlerFunction(): string {
                return this.handlerFunction;
            }

            getEventType(): string {
                return this.eventType;
            }

            getTriggerSource(): any {
                return this.source;
            }
        }

        /** Mock Session service for timezone and user info */
        export class MockSession {
            private timezone: string = 'America/New_York';
            private userEmail: string = 'test@example.com';

            static install(): void {
                (globalThis as any).Session = new MockSession();
            }

            static reset(): void {
                delete (globalThis as any).Session;
            }

            getScriptTimeZone(): string {
                return this.timezone;
            }

            getActiveUser(): { getEmail(): string } {
                return { getEmail: () => this.userEmail };
            }

            // Helper for tests
            setTimeZone(tz: string): void {
                this.timezone = tz;
            }

            setUserEmail(email: string): void {
                this.userEmail = email;
            }
        }

        /** Mock Utilities service for date/time operations */
        export class MockUtilities {
            static install(): void {
                (globalThis as any).Utilities = new MockUtilities();
            }

            static reset(): void {
                delete (globalThis as any).Utilities;
            }

            formatDate(date: Date, timeZone: string, format: string): string {
                // Simple mock - in real GAS this would format properly
                return `${date.toISOString().split('T')[0]} (${timeZone})`;
            }

            sleep(milliseconds: number): void {
                // In GAS this would actually pause execution
                // For testing, we just record that it was called
                (this as any).__lastSleepMs = milliseconds;
            }

            // Helper for tests
            getLastSleepDuration(): number | undefined {
                return (this as any).__lastSleepMs;
            }
        }

        /** Mock LockService for testing distributed locking */
        export class MockLockService {
            private locks: { [key: string]: { acquired: boolean; timeout?: number } } = {};

            static install(): void {
                (globalThis as any).LockService = new MockLockService();
            }

            static reset(): void {
                delete (globalThis as any).LockService;
            }

            getScriptLock(): MockLock {
                return new MockLock('script', this);
            }

            getDocumentLock(): MockLock {
                return new MockLock('document', this);
            }

            getUserLock(): MockLock {
                return new MockLock('user', this);
            }

            // Internal methods for mock implementation
            _acquireLock(key: string, timeout?: number): boolean {
                if (this.locks[key]?.acquired) {
                    return false; // Already locked
                }
                this.locks[key] = { acquired: true, timeout };
                return true;
            }

            _releaseLock(key: string): void {
                if (this.locks[key]) {
                    this.locks[key].acquired = false;
                }
            }

            // Helper for tests
            reset(): void {
                this.locks = {};
            }

            isLocked(type: string): boolean {
                return this.locks[type]?.acquired || false;
            }
        }

        export class MockLock {
            constructor(
                private type: string,
                private lockService: MockLockService
            ) {}

            tryLock(timeoutInMillis: number): boolean {
                return this.lockService._acquireLock(this.type, timeoutInMillis);
            }

            waitLock(timeoutInMillis: number): void {
                if (!this.lockService._acquireLock(this.type, timeoutInMillis)) {
                    throw new Error(`Could not acquire ${this.type} lock within ${timeoutInMillis}ms`);
                }
            }

            releaseLock(): void {
                this.lockService._releaseLock(this.type);
            }

            hasLock(): boolean {
                return this.lockService.isLocked(this.type);
            }
        }

        /** Mock Logger for GAS console logging */
        export class MockLogger {
            public logs: string[] = [];

            static install(): void {
                (globalThis as any).Logger = new MockLogger();
            }

            static reset(): void {
                delete (globalThis as any).Logger;
            }

            log(message: any): void {
                this.logs.push(String(message));
            }

            // Helper for tests
            reset(): void {
                this.logs = [];
            }

            getLastLog(): string | undefined {
                return this.logs[this.logs.length - 1];
            }

            getAllLogs(): string[] {
                return [...this.logs];
            }
        }

        /** Setup all GAS environment mocks */
        export function installAll(): void {
            MockSpreadsheetApp.install();
            MockScriptApp.install();
            MockSession.install();
            MockUtilities.install();
            MockLockService.install();
            MockLogger.install();
        }

        /** Reset all GAS environment mocks */
        export function resetAll(): void {
            MockSpreadsheetApp.reset();
            MockScriptApp.reset();
            MockSession.reset();
            MockUtilities.reset();
            MockLockService.reset();
            MockLogger.reset();
        }
    }
}