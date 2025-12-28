/**
 * StringHelper - String templating and formatting utilities
 */
/**
 * Format string with indexed placeholders {0}, {1}, etc.
 * @param formatText Template string with {n} placeholders
 * @param args Values to substitute into placeholders
 * @returns Formatted string
 */
export declare function formatString(formatText: string, ...args: Array<string | number>): string;
export declare function formatDate(date: Date, format: string, tz?: string | null): string;
export declare function resolveString(str: string, context: any): string;
export declare function get(obj: any, path: string, defaultValue?: any): any;
//# sourceMappingURL=index.d.ts.map