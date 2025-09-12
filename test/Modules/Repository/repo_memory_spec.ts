/// <reference path="../../_framework/Assert.ts" />
/// <reference path="../../_framework/Test.ts" />
/// <reference path="../../_framework/Runner.ts" />
/// <reference path="../../_framework/GasReporter.ts" />
/// <reference path="../../../src/Modules/Repository/Core.Types.d.ts" />
/// <reference path="../../../src/Modules/Repository/Errors.ts" />
/// <reference path="../../../src/Modules/Repository/Codec.Simple.ts" />
/// <reference path="../../../src/Modules/Repository/Engine.ts" />
/// <reference path="../../../src/Modules/Repository/Adapters.Memory.ts" />

namespace RepoSpec {
    type User = { id: string; org: string; name: string; age: number | null }
    type Key = 'id' | 'org'

    const schema: Repository.Ports.Schema<User, Key> = {
        parameters: ['id', 'org', 'name', 'age'],
        keyParameters: ['id', 'org'],
        instantiate() { return { id: '', org: '', name: '', age: null } },
        fromPartial(p: Partial<User>) {
            return {
                id: String(p.id ?? ''),
                org: String(p.org ?? ''),
                name: String(p.name ?? ''),
                age: (p.age == null ? null : Number(p.age))
            }
        },
        onBeforeSave(e) { return { ...e, name: e.name.trim() } },
        onAfterLoad(raw) { return raw as User },
        schemaVersion: 1
    }

    // Compose a codec that lists keys in schema.keyParameters order
    const codec = (function(){
        const c = Repository.Codec.simple<User, Key>(',')
        return {
            stringify(key: Pick<User, Key>): string {
                return [key.id, key.org].map(v => (v == null ? '' : String(v))).join(',')
            },
            parse(s: string): Pick<User, Key> {
                const parts = (c.parse as any)(s) as string[]
                return { id: (parts[0] ?? ''), org: (parts[1] ?? '') }
            }
        } as Repository.Ports.KeyCodec<User, Key>
    })()

    class Log implements Repository.Ports.Logger { info(_: string){} error(_: string){} }

    T.it('upsert adds and updates, then find/findAll work', () => {
        const store = new Repository.Adapters.Memory.Store<User, Key>()
        const repo = Repository.Engine.create<User, Key>({ schema, store, keyCodec: codec, logger: new Log() })
        repo.load()
        const r1 = repo.upsert({ id: 'u1', org: 'o1', name: ' Alice ', age: 20 })
        TAssert.equals(r1.added.length, 1, 'added 1')
        TAssert.equals(r1.updated.length, 0, 'updated 0')

        const r2 = repo.upsert([
            { id: 'u2', org: 'o1', name: 'Bob', age: null },
            { id: 'u1', org: 'o1', name: 'Alice A', age: 21 }
        ])
        TAssert.equals(r2.added.length, 1, 'added 1 more')
        TAssert.equals(r2.updated.length, 1, 'updated 1')

        const f1 = repo.find({ id: 'u1', org: 'o1' })
        TAssert.isTrue(!!f1 && f1.name === 'Alice A' && f1.age === 21, 'find u1,o1')

        const fAll = repo.findAll([{ id: 'u1', org: 'o1' }, { id: 'uX', org: 'o1' }])
        TAssert.equals(fAll.length, 1, 'findAll returns only existing')
    })

    T.it('delete removes rows by key', () => {
        const store = new Repository.Adapters.Memory.Store<User, Key>()
        const repo = Repository.Engine.create<User, Key>({ schema, store, keyCodec: codec })
        repo.load()
        repo.upsert([{ id: 'u1', org: 'o1', name: 'n1', age: null }, { id: 'u2', org: 'o1', name: 'n2', age: null }])
        const d1 = repo.delete({ id: 'u1', org: 'o1' })
        TAssert.equals(d1.deleted, 1, 'deleted 1')
        const f1 = repo.find({ id: 'u1', org: 'o1' })
        TAssert.isTrue(f1 === null, 'deleted record is gone')
    })

    T.it('invalid key throws RepositoryError', () => {
        const store = new Repository.Adapters.Memory.Store<User, Key>()
        const repo = Repository.Engine.create<User, Key>({ schema, store, keyCodec: codec })
        repo.load()
        TAssert.throws(() => repo.upsert({ id: '', org: 'o1', name: 'x', age: null }), 'missing key should throw')
    })

    T.it('schema hooks onBeforeSave/afterLoad are applied', () => {
        const store = new Repository.Adapters.Memory.Store<User, Key>()
        const repo = Repository.Engine.create<User, Key>({ schema, store, keyCodec: codec })
        repo.load()
        repo.upsert({ id: 'u3', org: 'o1', name: ' Carol  ', age: 33 })
        const e = repo.find({ id: 'u3', org: 'o1' })!
        TAssert.equals(e.name, 'Carol', 'name trimmed by onBeforeSave')
    })
}
