/**
 * Repository共通ロジックテスト
 *
 * 注意: このファイルのテストは test/shared/repository/core.test.ts に移動済みです
 * 両環境（GAS/Node.js）で実行される共通ロジックテストは shared フォルダを参照してください
 *
 * GAS固有のテストは gas_spreadsheet_spec.ts を参照してください
 */

namespace Spec_Repo {
    // Import global Repository into namespace scope
    const Repository = (globalThis as any).Repository;
    const Shared = (globalThis as any).Shared;

    type User = { id: string; org: string; name: string; age: number | null }
    type Key = 'id' | 'org'

    const schema: Repository.Ports.Schema<User, Key> = {
        parameters: ['id', 'org', 'name', 'age'],
        keyParameters: ['id', 'org'],
        instantiate() { return { id: '', org: '', name: '', age: null }; },
        fromPartial(p: Partial<User>) {
            return {
                id: String(p.id ?? ''),
                org: String(p.org ?? ''),
                name: String(p.name ?? ''),
                age: (p.age == null ? null : Number(p.age))
            };
        },
        onBeforeSave(e) { return { ...e, name: e.name.trim() }; },
        onAfterLoad(raw) { return raw as User; },
        schemaVersion: 1
    };

    // Compose a codec that lists keys in schema.keyParameters order
    const codec = (function () {
        const c = Repository.Codec.simple<User, Key>(['id', 'org'], ',');
        return {
            stringify(key: Pick<User, Key>): string {
                return [key.id, key.org].map(v => (v == null ? '' : String(v))).join(',');
            },
            parse(s: string): Pick<User, Key> {
                return c.parse(s) as Pick<User, Key>;
            }
        } as Repository.Ports.KeyCodec<User, Key>;
    })();

    class Log implements Shared.Types.Logger { info(_: string) { } error(_: string) { } }

    T.it('upsert adds and updates, then find/findAll work', () => {
        // Test Case: Normal operation - add new records and update existing ones
        const store = new Repository.MemoryStore<User>();
        const repo = Repository.Engine.create<User, Key>({ schema, store, keyCodec: codec, logger: new Log() });
        repo.load();

        // Test: Adding a new record
        const r1 = repo.upsert({ id: 'u1', org: 'o1', name: ' Alice ', age: 20 });
        TAssert.equals(r1.added.length, 1, 'added 1');
        TAssert.equals(r1.updated.length, 0, 'updated 0');

        // Test: Batch operation with both add and update
        const r2 = repo.upsert([
            { id: 'u2', org: 'o1', name: 'Bob', age: null },  // new record
            { id: 'u1', org: 'o1', name: 'Alice A', age: 21 }  // update existing
        ]);
        TAssert.equals(r2.added.length, 1, 'added 1 more');
        TAssert.equals(r2.updated.length, 1, 'updated 1');

        // Test: Find single record by composite key
        const f1 = repo.find({ id: 'u1', org: 'o1' });
        TAssert.isTrue(!!f1 && f1.name === 'Alice A' && f1.age === 21, 'find u1,o1');

        // Test: Batch find with some non-existent keys
        const fAll = repo.findAll([{ id: 'u1', org: 'o1' }, { id: 'uX', org: 'o1' }]);
        TAssert.equals(fAll.length, 1, 'findAll returns only existing');
    }, 'Repository');

    T.it('delete removes rows by key', () => {
        // Test Case: Record deletion functionality
        const store = new Repository.MemoryStore<User>();
        const repo = Repository.Engine.create<User, Key>({ schema, store, keyCodec: codec });
        repo.load();

        // Setup: Add test records
        repo.upsert([
            { id: 'u1', org: 'o1', name: 'n1', age: null },
            { id: 'u2', org: 'o1', name: 'n2', age: null }
        ]);

        // Test: Delete single record
        const d1 = repo.delete({ id: 'u1', org: 'o1' });
        TAssert.equals(d1.deleted, 1, 'deleted 1');

        // Verify: Record is actually removed
        const f1 = repo.find({ id: 'u1', org: 'o1' });
        TAssert.isTrue(f1 === null, 'deleted record is gone');
    }, 'Repository');

    T.it('invalid key throws RepositoryError', () => {
        // Test Case: Error handling for invalid/missing key values
        const store = new Repository.MemoryStore<User>();
        const repo = Repository.Engine.create<User, Key>({ schema, store, keyCodec: codec });
        repo.load();

        // Edge Case: Empty string in required key field should throw
        TAssert.throws(() => repo.upsert({ id: '', org: 'o1', name: 'x', age: null }), 'missing key should throw');
    }, 'Repository');

    T.it('schema hooks onBeforeSave/afterLoad are applied', () => {
        // Test Case: Schema transformation hooks work correctly
        const store = new Repository.MemoryStore<User>();
        const repo = Repository.Engine.create<User, Key>({ schema, store, keyCodec: codec });
        repo.load();

        // Test: onBeforeSave hook transforms data (trimming spaces)
        repo.upsert({ id: 'u3', org: 'o1', name: ' Carol  ', age: 33 });
        const e = repo.find({ id: 'u3', org: 'o1' })!;
        TAssert.equals(e.name, 'Carol', 'name trimmed by onBeforeSave');
    }, 'Repository');

    T.it('edge case: null and undefined handling', () => {
        // Test Case: Edge cases with null/undefined values
        const store = new Repository.MemoryStore<User>();
        const repo = Repository.Engine.create<User, Key>({ schema, store, keyCodec: codec });
        repo.load();

        // Test: Null age value should be preserved
        repo.upsert({ id: 'u4', org: 'o1', name: 'David', age: null });
        const e1 = repo.find({ id: 'u4', org: 'o1' })!;
        TAssert.isTrue(e1.age === null, 'null age preserved');

        // Test: Partial entity with missing optional field
        repo.upsert({ id: 'u5', org: 'o1', name: 'Eve' } as any);
        const e2 = repo.find({ id: 'u5', org: 'o1' })!;
        TAssert.isTrue(e2.age === null, 'missing age becomes null');
    }, 'Repository');

    T.it('edge case: find non-existent record returns null', () => {
        // Test Case: Query for records that don't exist
        const store = new Repository.MemoryStore<User>();
        const repo = Repository.Engine.create<User, Key>({ schema, store, keyCodec: codec });
        repo.load();

        // Edge Case: Finding non-existent record should return null, not throw
        const notFound = repo.find({ id: 'nonexistent', org: 'missing' });
        TAssert.isTrue(notFound === null, 'non-existent record returns null');

        // Edge Case: Batch find with all non-existent keys returns empty array
        const noneFound = repo.findAll([{ id: 'x', org: 'y' }, { id: 'a', org: 'b' }]);
        TAssert.equals(noneFound.length, 0, 'all non-existent returns empty array');
    }, 'Repository');
}
