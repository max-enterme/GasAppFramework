import { loadNamespaceTs } from './helpers/loadNamespace'
loadNamespaceTs('src/Modules/Routing/Engine.ts')

const Routing: any = (global as any).Routing

describe('Routing Engine (Node)', () => {
  test('param match', () => {
    const r = Routing.create()
    r.register('/u/:id', (ctx:any)=> ctx.params.id)
    const out = r.dispatch('/u/42', {} as any)
    expect(out).toBe('42')
  })
})
