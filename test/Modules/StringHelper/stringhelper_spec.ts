namespace Spec_StringHelper {
    T.it('formatString replaces indexed placeholders', () => {
        const s = StringHelper.formatString('Hello {0}, {1}!', 'Alice', 'World')
        TAssert.equals(s, 'Hello Alice, World!', 'indexed replacement works')
    }, 'StringHelper')

    T.it('formatDate works without GAS (fallback formatter)', () => {
        const d = new Date('2025-03-04T05:06:07Z')
        const s = StringHelper.formatDate(d, 'yyyy-MM-dd HH:mm:ss', 'Etc/UTC')
        TAssert.equals(s, '2025-03-04 05:06:07', 'basic yyyy-MM-dd HH:mm:ss in UTC')
    }, 'StringHelper')

    T.it('resolveString resolves dot paths and function calls', () => {
        const ctx = {
            user: { name: 'Alice', roles: ['admin', 'editor'] },
            upper: (x: string) => x.toUpperCase(),
            concat: (a: string, b: string) => a + b
        }
        const s = StringHelper.resolveString('Hi {{user.name}} {{upper("x")}} {{user.roles[0]}} {{concat(user.name, "!")}}', ctx)
        TAssert.equals(s, 'Hi Alice X admin Alice!', 'template resolves values and functions')
    }, 'StringHelper')

    T.it('get resolves path with default', () => {
        const ctx = { a: { b: { c: 1 } } }
        TAssert.equals(StringHelper.get(ctx, 'a.b.c', 0), 1, 'existing path')
        TAssert.equals(StringHelper.get(ctx, 'a.x.c', 0), 0, 'default for missing path')
    }, 'StringHelper')
}
