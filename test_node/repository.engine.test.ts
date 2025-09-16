import { loadNamespaceTs } from './helpers/loadNamespace'
loadNamespaceTs(
    'src/Modules/Repository/Engine.ts',
    'src/Modules/Repository/Adapters.Memory.ts',
    'src/Modules/Repository/Codec.Simple.ts'
)

const Repository: any = (global as any).Repository

type User = { id: string; org: string; name: string }

const schema: any = {
    parameters: ['id', 'org', 'name'],
    keyParameters: ['id', 'org'],
    instantiate() { return { id: '', org: '', name: '' } },
    fromPartial(p: Partial<User>) { return { id: String(p.id ?? ''), org: String(p.org ?? ''), name: String(p.name ?? '') } },
    onBeforeSave(e: User) { return { ...e, name: e.name.trim() } }
}

const codec: any = {
    stringify(k: any) { return `${k.id},${k.org}` },
    parse(s: string) { const [id, org] = s.split(','); return { id, org } }
}

describe('Repository Engine (Node)', () => {
    test('upsert and find', () => {
        const store = new (Repository.Adapters.Memory.Store as any)()
        const repo = Repository.Engine.create({ schema, store, keyCodec: codec })
        repo.load()
        repo.upsert({ id: 'u1', org: 'o1', name: ' Alice ' })
        const e = repo.find({ id: 'u1', org: 'o1' })
        expect(e.name).toBe('Alice')
    })
})
