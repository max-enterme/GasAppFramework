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
export declare function simple<TEntity extends object, Key extends keyof TEntity>(keyFields?: string[], delim?: string): RepositoryTypes.Ports.KeyCodec<TEntity, Key>;
//# sourceMappingURL=Codec.d.ts.map