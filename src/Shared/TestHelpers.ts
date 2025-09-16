/**
 * Shared Test Helpers and Doubles
 * Consolidates test utilities for better reusability
 * Future ESModule: export { TestDoubles, TestAssertions } from './TestHelpers'
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

            constructor(initialTime: Date = new Date()) {
                this.currentTime = new Date(initialTime.getTime());
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
}