/**
 * Repository Codec Utilities - Key encoding and decoding
 */

import type * as RepositoryTypes from './Types';

/**
 * Creates a simple key codec with configurable delimiter
 * @param keyFields Array of key field names (optional, inferred from first stringify call if not provided)
 * @param delim Delimiter character (default: '|')
 * @returns KeyCodec instance for stringify/parse operations
 *
 * Example:
 * ```typescript
 * const codec = simple<User, 'id' | 'org'>(['id', 'org'], '|');
 * const key = { id: 'user123', org: 'acme' };
 * const str = codec.stringify(key); // 'user123|acme'
 * const parsed = codec.parse(str); // { id: 'user123', org: 'acme' }
 * ```
 */
export function simple<TEntity extends object, Key extends keyof TEntity>(
    keyFields?: string[],
    delim = '|'
): RepositoryTypes.Ports.KeyCodec<TEntity, Key> {
    /**
     * Escape special characters (backslash and delimiter)
     */
    const delimRegex = new RegExp(`[${delim}]`, 'g');
    const escape = (s: string): string =>
        s.replace(/\\/g, '\\\\').replace(delimRegex, (match) => '\\' + match);

    // Store key field names from parameter or first stringify call
    let storedKeyFields: string[] | null = keyFields || null;

    return {
        /**
         * Convert key object to delimited string
         */
        stringify(key: any): string {
            const parts: string[] = [];
            const keys = Object.keys(key);

            // Store key fields on first call for use in parse (if not already provided)
            if (storedKeyFields === null) {
                storedKeyFields = keys;
            }

            for (const k of keys) {
                const value = key[k];
                const stringValue = value == null ? '' : String(value);
                parts.push(escape(stringValue));
            }

            return parts.join(delim);
        },

        /**
         * Parse delimited string back to key object
         */
        parse(s: string): any {
            const parts: string[] = [];
            let current = '';

            for (let i = 0; i < s.length; i++) {
                const char = s[i];

                // Handle escape sequences
                if (char === '\\' && i + 1 < s.length) {
                    current += s[i + 1];
                    i++;
                } else if (char === delim) {
                    // Delimiter: push current part and start new one
                    parts.push(current);
                    current = '';
                }  else {
                    current += char;
                }
            }

            parts.push(current);

            // Map array back to object using stored key fields
            const result: any = {};
            if (storedKeyFields) {
                for (let i = 0; i < storedKeyFields.length && i < parts.length; i++) {
                    result[storedKeyFields[i]] = parts[i];
                }
            }

            return result;
        },
    };
}
