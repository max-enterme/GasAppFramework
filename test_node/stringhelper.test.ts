/**
 * StringHelper Tests
 * Comprehensive Node.js tests for the StringHelper module functionality
 */

import { setupGASMocks } from './test-utils'
import { formatString, formatDate, resolveString, get } from './stringhelper-module'

// Set up GAS environment mocks before tests
beforeAll(() => {
    setupGASMocks()
})

describe('StringHelper Tests', () => {
    describe('formatString', () => {
        test('should format string with single placeholder', () => {
            const result = formatString('Hello {0}!', 'World')
            expect(result).toBe('Hello World!')
        })

        test('should format string with multiple placeholders', () => {
            const result = formatString('{0} is {1} years old', 'John', 25)
            expect(result).toBe('John is 25 years old')
        })

        test('should format string with repeated placeholders', () => {
            const result = formatString('{0} loves {0}', 'Alice')
            expect(result).toBe('Alice loves Alice')
        })

        test('should handle missing arguments gracefully', () => {
            const result = formatString('Hello {0} and {1}!', 'World')
            expect(result).toBe('Hello World and {1}!')
        })

        test('should handle numeric arguments', () => {
            const result = formatString('Price: ${0}', 99.99)
            expect(result).toBe('Price: $99.99')
        })

        test('should handle empty template string', () => {
            const result = formatString('', 'arg')
            expect(result).toBe('')
        })

        test('should handle template with no placeholders', () => {
            const result = formatString('No placeholders here', 'unused')
            expect(result).toBe('No placeholders here')
        })
    })

    describe('formatDate', () => {
        const testDate = new Date('2024-03-15T14:30:45Z')

        beforeEach(() => {
            // Reset GAS mocks before each test
            delete (globalThis as any).Utilities
            delete (globalThis as any).Session
        })

        test('should format date with basic tokens', () => {
            const result = formatDate(testDate, 'yyyy-MM-dd')
            expect(result).toBe('2024-03-15')
        })

        test('should format date with time tokens', () => {
            const result = formatDate(testDate, 'yyyy-MM-dd HH:mm:ss')
            expect(result).toBe('2024-03-15 14:30:45')
        })

        test('should format date with custom pattern', () => {
            const result = formatDate(testDate, 'dd/MM/yyyy')
            expect(result).toBe('15/03/2024')
        })

        test('should format time only', () => {
            const result = formatDate(testDate, 'HH:mm')
            expect(result).toBe('14:30')
        })

        test('should use GAS Utilities when available', () => {
            // Mock the GAS environment
            const mockUtilities = {
                formatDate: jest.fn(() => '2024-03-15 (GAS formatted)')
            }
            const mockSession = {
                getScriptTimeZone: jest.fn(() => 'America/New_York')
            }

            ;(globalThis as any).Utilities = mockUtilities
            ;(globalThis as any).Session = mockSession

            const result = formatDate(testDate, 'yyyy-MM-dd', 'America/Los_Angeles')

            expect(mockUtilities.formatDate).toHaveBeenCalledWith(
                testDate, 
                'America/Los_Angeles', 
                'yyyy-MM-dd'
            )
            expect(result).toBe('2024-03-15 (GAS formatted)')
        })

        test('should fall back to default timezone when none specified', () => {
            const mockUtilities = {
                formatDate: jest.fn(() => 'formatted with default tz')
            }
            const mockSession = {
                getScriptTimeZone: jest.fn(() => 'America/New_York')
            }

            ;(globalThis as any).Utilities = mockUtilities
            ;(globalThis as any).Session = mockSession

            formatDate(testDate, 'yyyy-MM-dd')

            expect(mockSession.getScriptTimeZone).toHaveBeenCalled()
            expect(mockUtilities.formatDate).toHaveBeenCalledWith(
                testDate, 
                'America/New_York', 
                'yyyy-MM-dd'
            )
        })
    })

    describe('resolveString', () => {
        const context = {
            name: 'John',
            age: 30,
            address: {
                city: 'New York',
                country: 'USA'
            },
            skills: ['JavaScript', 'TypeScript', 'Node.js']
        }

        test('should resolve simple placeholders', () => {
            const result = resolveString('Hello {{name}}!', context)
            expect(result).toBe('Hello John!')
        })

        test('should resolve nested properties', () => {
            const result = resolveString('City: {{address.city}}', context)
            expect(result).toBe('City: New York')
        })

        test('should resolve multiple placeholders', () => {
            const result = resolveString('{{name}} is {{age}} years old', context)
            expect(result).toBe('John is 30 years old')
        })

        test('should handle missing properties gracefully', () => {
            const result = resolveString('{{name}} has {{missing}} property', context)
            expect(result).toBe('John has  property')
        })

        test('should handle array access', () => {
            const result = resolveString('First skill: {{skills[0]}}', context)
            expect(result).toBe('First skill: JavaScript')
        })

        test('should handle empty placeholders', () => {
            const result = resolveString('{{}} empty', context)
            expect(result).toBe(' empty') // Empty expression should return empty string
        })

        test('should handle whitespace in placeholders', () => {
            const result = resolveString('{{ name }} with spaces', context)
            expect(result).toBe('John with spaces')
        })

        test('should handle string without placeholders', () => {
            const result = resolveString('No placeholders', context)
            expect(result).toBe('No placeholders')
        })
    })

    describe('get', () => {
        const testObject = {
            user: {
                profile: {
                    name: 'Alice',
                    settings: {
                        theme: 'dark',
                        notifications: true
                    }
                },
                posts: [
                    { title: 'First Post', views: 100 },
                    { title: 'Second Post', views: 250 }
                ]
            },
            config: {
                version: '1.0.0'
            }
        }

        test('should get simple property', () => {
            const result = get(testObject, 'user.profile.name')
            expect(result).toBe('Alice')
        })

        test('should get nested property', () => {
            const result = get(testObject, 'user.profile.settings.theme')
            expect(result).toBe('dark')
        })

        test('should get array element', () => {
            const result = get(testObject, 'user.posts[0].title')
            expect(result).toBe('First Post')
        })

        test('should return default value for missing property', () => {
            const result = get(testObject, 'user.missing.property', 'default')
            expect(result).toBe('default')
        })

        test('should return undefined for missing property without default', () => {
            const result = get(testObject, 'missing.path')
            expect(result).toBeUndefined()
        })

        test('should handle null/undefined objects gracefully', () => {
            const result = get(null, 'any.path', 'fallback')
            expect(result).toBe('fallback')
        })

        test('should get root object with empty path', () => {
            const result = get(testObject, '')
            expect(result).toBe(testObject)
        })

        test('should handle array indices correctly', () => {
            const arrayObj = { items: ['a', 'b', 'c'] }
            expect(get(arrayObj, 'items[0]')).toBe('a')
            expect(get(arrayObj, 'items[2]')).toBe('c')
            expect(get(arrayObj, 'items[5]')).toBeUndefined()
        })

        test('should handle complex nested structures', () => {
            const complex = {
                data: {
                    users: [
                        { name: 'John', roles: ['admin', 'user'] },
                        { name: 'Jane', roles: ['user'] }
                    ]
                }
            }

            expect(get(complex, 'data.users[0].name')).toBe('John')
            expect(get(complex, 'data.users[0].roles[0]')).toBe('admin')
            expect(get(complex, 'data.users[1].roles[0]')).toBe('user')
        })
    })
})