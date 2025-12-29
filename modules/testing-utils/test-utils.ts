/**
 * Test utilities for Node.js testing
 * This module provides utilities and mocks for testing the GAS App Framework in Node.js
 */

/**
 * Mock GAS environment globals for testing
 */
export function setupGASMocks(): void {
    // Mock Utilities service
    (globalThis as any).Utilities = {
        formatDate: jest.fn((_date: Date, _zone: string, _format: string) => {
            // Simple mock implementation - return ISO date format
            return _date.toISOString().split('T')[0];
        })
    };

    // Mock Session service
    (globalThis as any).Session = {
        getScriptTimeZone: jest.fn(() => 'America/New_York')
    };
}

/**
 * Create a mock logger for testing
 */
export function createMockLogger() {
    return {
        info: jest.fn(),
        error: jest.fn()
    };
}

/**
 * Create test data for user entities
 */
export function createTestUser(overrides: Partial<{ id: string; name: string; email: string; org: string }> = {}) {
    return {
        id: 'test-user-1',
        name: 'Test User',
        email: 'test@example.com',
        org: 'test-org',
        ...overrides
    };
}

/**
 * Create test data for multiple users
 */
export function createTestUsers(count: number = 3) {
    return Array.from({ length: count }, (_, i) => createTestUser({
        id: `user-${i + 1}`,
        name: `Test User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        org: `org-${i + 1}`
    }));
}
