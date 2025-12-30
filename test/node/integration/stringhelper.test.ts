/**
 * StringHelper Integration Tests
 * GAS環境特有の統合テスト（formatDateのGAS API連携など）
 */

import { setupGASMocks } from '../../../modules/testing-utils/test-utils';
import * as StringHelper from '../../../modules/string-helper';

// Set up GAS environment mocks before tests
beforeAll(() => {
    setupGASMocks();
});

describe('StringHelper GAS Integration Tests', () => {
    describe('formatDate - GAS API Integration', () => {
        const testDate = new Date('2024-03-15T14:30:45Z');

        beforeEach(() => {
            // Reset GAS mocks before each test
            delete (globalThis as any).Utilities;
            delete (globalThis as any).Session;
        });

        test('should use GAS Utilities when available', () => {
            // Mock the GAS environment
            const mockUtilities = {
                formatDate: jest.fn(() => '2024-03-15 (GAS formatted)')
            };
            const mockSession = {
                getScriptTimeZone: jest.fn(() => 'America/New_York')
            }

            ;(globalThis as any).Utilities = mockUtilities
            ;(globalThis as any).Session = mockSession;

            const result = StringHelper.formatDate(testDate, 'yyyy-MM-dd', 'America/Los_Angeles');

            expect(mockUtilities.formatDate).toHaveBeenCalledWith(
                testDate,
                'America/Los_Angeles',
                'yyyy-MM-dd'
            );
            expect(result).toBe('2024-03-15 (GAS formatted)');
        });

        test('should fall back to default timezone when none specified', () => {
            const mockUtilities = {
                formatDate: jest.fn(() => 'formatted with default tz')
            };
            const mockSession = {
                getScriptTimeZone: jest.fn(() => 'America/New_York')
            }

            ;(globalThis as any).Utilities = mockUtilities
            ;(globalThis as any).Session = mockSession;

            StringHelper.formatDate(testDate, 'yyyy-MM-dd');

            expect(mockSession.getScriptTimeZone).toHaveBeenCalled();
            expect(mockUtilities.formatDate).toHaveBeenCalledWith(
                testDate,
                'America/New_York',
                'yyyy-MM-dd'
            );
        });

        test('should format with basic tokens when GAS not available', () => {
            const result = StringHelper.formatDate(testDate, 'yyyy-MM-dd');
            expect(result).toBe('2024-03-15');
        });

        test('should format with time tokens when GAS not available', () => {
            const result = StringHelper.formatDate(testDate, 'yyyy-MM-dd HH:mm:ss');
            expect(result).toBe('2024-03-15 14:30:45');
        });
    });
});

