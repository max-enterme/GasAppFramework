/**
 * Repository Codec Utilities - Key encoding and decoding
 */

namespace Repository.Codec {
    /**
     * Creates a simple key codec with configurable delimiter
     * @param delim Delimiter character (default: '|')
     * @returns KeyCodec instance for stringify/parse operations
     * 
     * Example:
     * ```typescript
     * const codec = Repository.Codec.simple<User, 'id' | 'org'>('|');
     * const key = { id: 'user123', org: 'acme' };
     * const str = codec.stringify(key); // 'user123|acme'
     * const parsed = codec.parse(str); // ['user123', 'acme']
     * ```
     */
    export function simple<TEntity extends object, Key extends keyof TEntity>(delim = '|') {
        /**
         * Escape special characters (backslash and delimiter)
         */
        const escape = (s: string): string => 
            s.replace(/\\/g, '\\\\').replace(new RegExp(`[${delim}]`, 'g'), match => '\\' + match);
        
        return {
            /**
             * Convert key object to delimited string
             */
            stringify(key: any): string {
                const parts: string[] = [];
                const keys = Object.keys(key);
                
                for (const k of keys) {
                    const value = key[k];
                    const stringValue = value == null ? '' : String(value);
                    parts.push(escape(stringValue));
                }
                
                return parts.join(delim);
            },
            
            /**
             * Parse delimited string back to array of values
             * Note: Returns array - caller must map back to key object
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
                    } else {
                        current += char;
                    }
                }
                
                parts.push(current);
                return parts;
            }
        } as Repository.Ports.KeyCodec<TEntity, Key> as any;
    }
}
